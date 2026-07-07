import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Course from '../models/Course.js';

// Load env variables immediately for module-level initialization
dotenv.config();

// Initialize Razorpay client using env variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

/**
 * Phase 2: Create Order
 * Receives the course price, multiplies by 100 for paise, and generates a Razorpay order.
 */
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;
    if (!amount) {
      return res.status(400).json({ message: "Course amount is required" });
    }

    // Convert amount to paise
    const amountInPaise = Math.round(parseFloat(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency,
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: error.message || "Failed to create Razorpay order" });
  }
};

/**
 * Phase 2: Verify & Enroll
 * Receives razorpay_payment_id, razorpay_order_id, and razorpay_signature.
 * Verifies signature. If valid, updates database to enroll user, saving purchaseDetails.
 */
export const verifyAndEnroll = async (req, res) => {
  try {
    const { 
      userId, 
      courseId, 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      amountPaid 
    } = req.body;

    if (!userId || !courseId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing required transaction verification details" });
    }

    // Verify signature
    console.log("=== Signature Verification ===");
    console.log("Order ID:", razorpay_order_id);
    console.log("Payment ID:", razorpay_payment_id);
    console.log("Received Signature:", razorpay_signature);
    console.log("Using Key Secret:", process.env.RAZORPAY_KEY_SECRET ? `Loaded (ends with ...${process.env.RAZORPAY_KEY_SECRET.slice(-4)})` : "NOT LOADED");

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    console.log("Generated Signature:", generated_signature);
    console.log("=============================");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed. Signature mismatch." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already enrolled
    const isAlreadyEnrolled = user.enrolledCourses.some(item => {
      if (!item) return false;
      const itemId = item.courseId ? item.courseId.toString() : item.toString();
      return itemId === courseId;
    });

    if (isAlreadyEnrolled) {
      return res.status(400).json({ message: "User is already enrolled in this course." });
    }

    // Fallback amountPaid calculation
    let finalAmountPaid = amountPaid;
    if (!finalAmountPaid) {
      const course = await Course.findById(courseId);
      finalAmountPaid = course ? course.price * 100 : 0;
    }

    // Add course enrollment with purchaseDetails
    user.enrolledCourses.push({
      courseId,
      purchaseDetails: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amountPaid: finalAmountPaid,
        enrollmentDate: new Date(),
        refundStatus: 'Eligible'
      }
    });

    await user.save();

    res.status(200).json({ 
      message: "Payment successfully verified and course enrolled!",
      enrolledCourses: user.enrolledCourses
    });
  } catch (error) {
    console.error("Verify & Enroll Error:", error);
    res.status(500).json({ message: error.message || "Failed to verify payment and enroll user" });
  }
};

/**
 * Phase 2: Claim Reward (75% Refund)
 * Triggered on course completion. Checks if eligible and within 30 days of enrollmentDate.
 * Initiates Razorpay Refund of 75% of amountPaid and updates schema values.
 */
export const claimReward = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({ message: "User ID and Course ID are required to claim rewards." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const enrollment = user.enrolledCourses.find(item => item.courseId.toString() === courseId);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment details not found for this course." });
    }

    const purchase = enrollment.purchaseDetails;
    if (!purchase || !purchase.paymentId) {
      return res.status(400).json({ message: "No payment history found for this course enrollment." });
    }

    if (purchase.refundStatus !== 'Eligible') {
      return res.status(400).json({ message: `Cashback status is already '${purchase.refundStatus}' for this course.` });
    }

    // Verify 30-day limit
    const enrollmentDate = new Date(purchase.enrollmentDate);
    const currentDate = new Date();
    const msDiff = currentDate.getTime() - enrollmentDate.getTime();
    const daysDiff = msDiff / (1000 * 3600 * 24);

    if (daysDiff > 30) {
      purchase.refundStatus = 'Expired';
      await user.save();
      return res.status(400).json({ message: "Reward claim period has expired (must complete within 30 days)." });
    }

    // Calculate 75% refund amount in paise
    const refundAmount = Math.round(purchase.amountPaid * 0.75);
    if (refundAmount <= 0) {
      return res.status(400).json({ message: "Paid amount is zero; no refund can be processed." });
    }

    // Process refund via Razorpay API
    const refund = await razorpay.payments.refund(purchase.paymentId, {
      amount: refundAmount,
      notes: {
        reason: "75% Cashback Completion Reward",
        userId: userId.toString(),
        courseId: courseId.toString()
      }
    });

    // Update status to Processed
    purchase.refundStatus = 'Processed';

    // Issue certificate representation on backend
    if (!user.passedExams) {
      user.passedExams = [];
    }
    if (!user.passedExams.includes(courseId)) {
      user.passedExams.push(courseId);
    }

    await user.save();

    res.status(200).json({
      message: "Cashback reward claimed successfully! 75% refund initiated.",
      refund,
      refundStatus: 'Processed',
      passedExams: user.passedExams
    });
  } catch (error) {
    console.error("Claim Reward Error:", error);
    res.status(500).json({ message: error.message || "Failed to process cashback reward refund" });
  }
};
