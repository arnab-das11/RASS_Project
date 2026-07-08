import { useState } from "react";
import {
    Upload, Plus, Link as LinkIcon, FileText, Video, Save, Loader, ArrowLeft,
    X, Check, Trash2, Image as ImageIcon, Clock, IndianRupee, Tag, BookOpen,
    ListChecks, GripVertical, FileArchive, CheckCircle2
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const InstructorCoursePage = () => {
    const navigate = useNavigate();

    // ==================== STATE MANAGEMENT ====================

    // --- Step 1: Course Info State ---
    const [courseData, setCourseData] = useState({
        title: "",
        description: "",
        category: "Web Development",
        level: "Beginner",
        duration: "",
        price: "",
        learningObjectives: [""] // Initialize with one empty input
    });
    const [thumbnail, setThumbnail] = useState(null);
    const [previewThumbnail, setPreviewThumbnail] = useState(null);
    const [createdCourseId, setCreatedCourseId] = useState(null);
    const [loadingCourse, setLoadingCourse] = useState(false);

    // --- Step 2: Section Content State ---
    const [sectionTitle, setSectionTitle] = useState("");
    const [videoFiles, setVideoFiles] = useState([]);
    const [videoDescs, setVideoDescs] = useState({}); // New description state mapping idx -> string
    const [resourceFiles, setResourceFiles] = useState([]);
    const [resourceDescs, setResourceDescs] = useState({}); // New description state mapping idx -> string
    const [links, setLinks] = useState([]);

    // Temp Link Input State
    const [tempLinkTitle, setTempLinkTitle] = useState("");
    const [tempLinkUrl, setTempLinkUrl] = useState("");
    const [tempLinkDesc, setTempLinkDesc] = useState("");

    // Temp YouTube Video State
    const [youtubeVideos, setYoutubeVideos] = useState([]);
    const [tempYtTitle, setTempYtTitle] = useState("");
    const [tempYtUrl, setTempYtUrl] = useState("");
    const [tempYtDesc, setTempYtDesc] = useState("");

    // Upload & UI State
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [addedSections, setAddedSections] = useState([]); // To preview the syllabus

    // ==================== HANDLERS: STEP 1 (COURSE) ====================

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnail(file);
            setPreviewThumbnail(URL.createObjectURL(file));
        }
    };

    const handleObjectiveChange = (index, value) => {
        const updated = [...courseData.learningObjectives];
        updated[index] = value;
        setCourseData({ ...courseData, learningObjectives: updated });
    };

    const addObjective = () => setCourseData({ ...courseData, learningObjectives: [...courseData.learningObjectives, ""] });
    const removeObjective = (index) => {
        const updated = courseData.learningObjectives.filter((_, i) => i !== index);
        setCourseData({ ...courseData, learningObjectives: updated });
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        if (!thumbnail) return alert("Please upload a course thumbnail.");

        // Filter out any empty learning objectives before sending
        const cleanedObjectives = courseData.learningObjectives.filter(obj => obj.trim() !== "");
        if (cleanedObjectives.length === 0) return alert("Please add at least one Learning Objective.");

        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) return alert("Please log in first.");

        setLoadingCourse(true);

        const formData = new FormData();
        formData.append("title", courseData.title);
        formData.append("description", courseData.description);
        formData.append("category", courseData.category);
        formData.append("level", courseData.level);
        formData.append("duration", courseData.duration);
        formData.append("price", courseData.price);
        formData.append("thumbnail", thumbnail);
        formData.append("instructorId", userInfo._id);
        formData.append("learningObjectives", JSON.stringify(cleanedObjectives));

        try {
            const { data } = await axios.post("http://localhost:5000/api/courses", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setCreatedCourseId(data._id);
            setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 500);
        } catch (error) {
            console.error(error);
            alert("Error creating course. Check console.");
        } finally {
            setLoadingCourse(false);
        }
    };

    // ==================== HANDLERS: STEP 2 (SECTIONS) ====================

    const handleVideoSelect = (e) => setVideoFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    const removeVideo = (index) => setVideoFiles((prev) => prev.filter((_, i) => i !== index));
    const handleResourceSelect = (e) => setResourceFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    const removeResource = (index) => setResourceFiles((prev) => prev.filter((_, i) => i !== index));

    const addLink = () => {
        if (tempLinkTitle && tempLinkUrl) {
            setLinks([...links, { title: tempLinkTitle, url: tempLinkUrl, description: tempLinkDesc }]);
            setTempLinkTitle(""); setTempLinkUrl(""); setTempLinkDesc("");
        }
    };
    const removeLink = (index) => setLinks(links.filter((_, i) => i !== index));

    const addYoutubeVideo = () => {
        if (tempYtTitle && tempYtUrl) {
            setYoutubeVideos([...youtubeVideos, { title: tempYtTitle, url: tempYtUrl, description: tempYtDesc }]);
            setTempYtTitle(""); setTempYtUrl(""); setTempYtDesc("");
        }
    };
    const removeYoutubeVideo = (index) => setYoutubeVideos(youtubeVideos.filter((_, i) => i !== index));

    const handleAddSection = async (e) => {
        e.preventDefault();
        if (!createdCourseId) return alert("Course ID missing.");
        if (videoFiles.length === 0 && resourceFiles.length === 0 && links.length === 0 && youtubeVideos.length === 0) {
            return alert("Add content first.");
        }

        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append("title", sectionTitle);
        videoFiles.forEach((file) => formData.append("videos", file));
        resourceFiles.forEach((file) => formData.append("resources", file));
        formData.append("links", JSON.stringify(links));
        formData.append("youtubeVideos", JSON.stringify(youtubeVideos));

        // Map description objects to match files indexes
        const videoDescArray = videoFiles.map((_, idx) => videoDescs[idx] || "");
        const resourceDescArray = resourceFiles.map((_, idx) => resourceDescs[idx] || "");
        formData.append("videoDescriptions", JSON.stringify(videoDescArray));
        formData.append("resourceDescriptions", JSON.stringify(resourceDescArray));

        try {
            await axios.post(`http://localhost:5000/api/courses/${createdCourseId}/lectures`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            // Update local syllabus preview
            setAddedSections([...addedSections, {
                title: sectionTitle,
                videos: videoFiles.length + youtubeVideos.length,
                resources: resourceFiles.length,
                links: links.length
            }]);

            // Reset form
            setSectionTitle("");
            setVideoFiles([]);
            setResourceFiles([]);
            setLinks([]);
            setVideoDescs({});
            setResourceDescs({});
            setTempLinkDesc("");
            setYoutubeVideos([]);
            setTempYtTitle("");
            setTempYtUrl("");
            setTempYtDesc("");
        } catch (error) {
            console.error(error);
            alert("Failed to upload. Check file sizes or connection.");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 relative text-slate-800 font-sans">

            {/* Top Navigation */}
            <button
                onClick={() => navigate('/instructor-dashboard')}
                className="fixed top-6 left-6 p-3 bg-white hover:bg-slate-100 rounded-full shadow-lg text-slate-500 hover:text-indigo-600 border border-slate-200 transition-all hover:scale-110 z-50 cursor-pointer"
                title="Back to Dashboard"
            >
                <ArrowLeft size={22} />
            </button>

            <div className="max-w-4xl mx-auto mt-4">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-indigo-600 tracking-tight mb-2">
                            Course Forge
                        </h1>
                        <p className="text-slate-500 font-semibold">Design your curriculum and upload your educational assets.</p>
                    </div>
                    {createdCourseId && (
                        <button onClick={() => navigate('/instructor-dashboard')} className="px-6 py-2.5 bg-indigo-50 hover:bg-indigo-600 border border-indigo-200 hover:border-transparent text-indigo-700 hover:text-white rounded-full font-bold transition-all shadow-lg flex items-center gap-2">
                            Complete Course <CheckCircle2 size={18} />
                        </button>
                    )}
                </div>

                {/* ==================== STEP 1: COURSE DETAILS ==================== */}
                <div className={`bg-white rounded-3xl shadow-xl p-8 mb-8 border border-slate-200/80 ${createdCourseId ? 'pointer-events-none' : ''}`}>
                    <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-4">
                        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 w-10 h-10 flex items-center justify-center rounded-xl text-white font-black shadow-lg shadow-indigo-200">1</div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Course Blueprint</h2>
                            <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Define the landing page details</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreateCourse} className="space-y-8">

                        {/* Title & Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <BookOpen size={16} className="text-indigo-600" /> Course Title
                                </label>
                                <input type="text" placeholder="e.g. Master MERN Stack"
                                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition placeholder-slate-400 font-medium"
                                    value={courseData.title} onChange={(e) => setCourseData({ ...courseData, title: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Tag size={16} className="text-indigo-600" /> Category
                                </label>
                                <select className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none font-medium"
                                    value={courseData.category} onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}>
                                    <option value="Web Development">Web Development</option>
                                    <option value="Data Structures & Algorithms">Data Structures & Algorithms (DSA)</option>
                                    <option value="Artificial Intelligence">Artificial Intelligence (AI/ML)</option>
                                    <option value="Cybersecurity">Cybersecurity</option>
                                    <option value="Cloud Computing">Cloud Computing</option>
                                    <option value="Mobile Development">Mobile Development</option>
                                    <option value="Data Science">Data Science</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                            <textarea placeholder="Write a compelling overview of the course..." rows="4"
                                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none placeholder-slate-400 font-medium resize-none"
                                value={courseData.description} onChange={(e) => setCourseData({ ...courseData, description: e.target.value })} required />
                        </div>

                        {/* --- NEW: WHAT YOU'LL LEARN BUILDER --- */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
                            <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <ListChecks size={18} className="text-emerald-600" /> What will students learn?
                            </label>
                            <div className="space-y-3">
                                {courseData.learningObjectives.map((obj, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <GripVertical size={16} className="text-slate-400 cursor-grab active:cursor-grabbing" />
                                        <input
                                            type="text"
                                            placeholder={`Learning objective ${idx + 1}...`}
                                            value={obj}
                                            onChange={(e) => handleObjectiveChange(idx, e.target.value)}
                                            className="flex-1 p-3 rounded-lg bg-white border border-slate-200 text-slate-800 focus:border-indigo-500 outline-none transition text-sm font-medium"
                                        />
                                        {courseData.learningObjectives.length > 1 && (
                                            <button type="button" onClick={() => removeObjective(idx)} className="text-red-650 hover:text-red-500 p-2 bg-red-50 hover:bg-red-100 rounded-lg transition border border-red-200/40">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addObjective} className="mt-4 flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-750 transition px-2 cursor-pointer">
                                <Plus size={16} /> Add another objective
                            </button>
                        </div>

                        {/* GRID: Level, Duration, Price */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Difficulty</label>
                                <select className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none font-medium"
                                    value={courseData.level} onChange={(e) => setCourseData({ ...courseData, level: e.target.value })}>
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Clock size={16} className="text-indigo-600" /> Duration (Hours)
                                </label>
                                <input type="number" placeholder="e.g. 2.5" min="0" step="0.1"
                                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none placeholder-slate-400 font-medium"
                                    value={courseData.duration} onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <IndianRupee size={16} className="text-indigo-600" /> Price (INR)
                                </label>
                                <input type="number" placeholder="0 for Free" min="0"
                                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none placeholder-slate-400 font-medium"
                                    value={courseData.price} onChange={(e) => setCourseData({ ...courseData, price: e.target.value })} />
                            </div>
                        </div>

                        {/* Thumbnail Upload */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Thumbnail Image</label>
                            <div className="border-2 border-dashed border-indigo-300 rounded-2xl p-6 text-center hover:bg-indigo-50/50 hover:border-indigo-500 transition cursor-pointer relative flex flex-col items-center justify-center group h-48 bg-slate-50">
                                {previewThumbnail ? (
                                    <div className="relative h-full w-full flex justify-center">
                                        <img src={previewThumbnail} alt="Preview" className="h-full object-cover rounded-xl shadow-md border border-slate-200 w-full" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-all duration-300">
                                            <span className="text-white text-sm font-bold flex items-center gap-2"><ImageIcon size={18} /> Replace Thumbnail</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="bg-indigo-50 p-4 rounded-full mb-4 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
                                            <ImageIcon className="text-indigo-600" size={36} />
                                        </div>
                                        <span className="text-sm text-slate-600 font-bold">Click or drag to upload cover image</span>
                                        <span className="text-xs text-slate-450 mt-2 font-medium">Recommended: 1280x720 (16:9)</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleThumbnailChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                        </div>

                        {!createdCourseId && (
                            <button type="submit" disabled={loadingCourse} className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-black text-lg flex justify-center items-center gap-3 transition-all shadow-xl shadow-indigo-100 transform hover:-translate-y-1 cursor-pointer">
                                {loadingCourse ? <Loader className="animate-spin" size={24} /> : <Save size={24} />}
                                {loadingCourse ? "Forging Database Entry..." : "Initialize Course Builder"}
                            </button>
                        )}
                    </form>
                </div>

                {/* ==================== STEP 2: MULTI-CONTENT UPLOAD ==================== */}
                {createdCourseId && (
                    <div className="space-y-8 animate-fade-in mb-20">

                        {/* --- NEW: SYLLABUS PREVIEW --- */}
                        {addedSections.length > 0 && (
                            <div className="bg-white rounded-3xl shadow-md p-8 border border-slate-200">
                                <h3 className="text-xl font-bold text-emerald-600 mb-6 flex items-center gap-2"><CheckCircle2 /> Built Curriculum ({addedSections.length} Sections)</h3>
                                <div className="space-y-3">
                                    {addedSections.map((sec, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <span className="font-bold text-slate-800 flex items-center gap-3">
                                                <div className="bg-indigo-50 w-6 h-6 rounded flex items-center justify-center text-xs text-indigo-600 font-bold">{idx + 1}</div>
                                                {sec.title}
                                            </span>
                                            <div className="flex gap-4 text-xs font-bold text-slate-500">
                                                <span className="flex items-center gap-1"><Video size={14} className="text-slate-400" /> {sec.videos}</span>
                                                <span className="flex items-center gap-1"><FileText size={14} className="text-slate-400" /> {sec.resources}</span>
                                                <span className="flex items-center gap-1"><LinkIcon size={14} className="text-slate-400" /> {sec.links}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- SECTION BUILDER FORM --- */}
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200 relative">
                            <div className="absolute -top-8 left-12 w-1 h-8 bg-indigo-600"></div>

                            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 w-10 h-10 flex items-center justify-center rounded-xl text-white font-black shadow-lg shadow-emerald-100">2</div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">Content Modules</h2>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Upload lectures & resources</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleAddSection} className="space-y-8">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Module Title</label>
                                    <input type="text" placeholder="e.g. Chapter 1: Foundations of JavaScript"
                                        className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none placeholder-slate-450 font-medium shadow-inner"
                                        value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} required />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* --- VIDEOS --- */}
                                    <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 hover:border-indigo-400 transition duration-300">
                                        <h3 className="text-sm font-black text-indigo-600 mb-4 flex items-center gap-2 uppercase tracking-wide"><Video size={16} /> Video Lectures</h3>
                                        <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-white hover:border-indigo-500 transition cursor-pointer group bg-white/50">
                                            <Plus className="mx-auto text-slate-400 mb-2 group-hover:text-indigo-600 transition group-hover:scale-125" size={24} />
                                            <p className="text-sm text-slate-650 font-bold">Select Video Files</p>
                                            <input type="file" accept="video/*" multiple onChange={handleVideoSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                        <div className="mt-4 space-y-3 max-h-56 overflow-y-auto custom-scrollbar pr-2">
                                            {videoFiles.map((file, i) => (
                                                <div key={i} className="flex flex-col bg-white p-3 rounded-lg border border-slate-200 shadow-sm gap-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold text-indigo-750 truncate max-w-[80%] flex items-center gap-2"><Check size={12} className="text-emerald-500" /> {file.name}</span>
                                                        <button type="button" onClick={() => removeVideo(i)} className="text-red-650 hover:text-red-500 bg-red-50 p-1.5 rounded"><Trash2 size={14} /></button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Video description / lesson notes..."
                                                        value={videoDescs[i] || ""}
                                                        onChange={(e) => setVideoDescs({ ...videoDescs, [i]: e.target.value })}
                                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 outline-none"
                                                    />
                                                </div>
                                            ))}
                                            {youtubeVideos.map((yt, i) => (
                                                <div key={`yt-${i}`} className="flex flex-col bg-rose-50/50 border border-rose-100 p-3 rounded-lg shadow-sm gap-2 animate-fade-in">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold text-rose-700 truncate max-w-[80%] flex items-center gap-2">
                                                            🔴 [YouTube] {yt.title}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeYoutubeVideo(i)}
                                                            className="text-red-650 hover:text-red-500 bg-red-55 bg-red-50 p-1.5 rounded"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 italic truncate block">{yt.url}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                                            <span className="text-xs font-bold text-slate-500 block">Or Embed YouTube Video</span>
                                            <div className="flex flex-col gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="YouTube Video Title"
                                                    value={tempYtTitle}
                                                    onChange={(e) => setTempYtTitle(e.target.value)}
                                                    className="w-full p-2 text-xs bg-white border border-slate-250 rounded text-slate-800 outline-none"
                                                />
                                                <input
                                                    type="url"
                                                    placeholder="YouTube Video URL (watch or share link)"
                                                    value={tempYtUrl}
                                                    onChange={(e) => setTempYtUrl(e.target.value)}
                                                    className="w-full p-2 text-xs bg-white border border-slate-250 rounded text-slate-800 outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Description / notes..."
                                                    value={tempYtDesc}
                                                    onChange={(e) => setTempYtDesc(e.target.value)}
                                                    className="w-full p-2 text-xs bg-white border border-slate-250 rounded text-slate-800 outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addYoutubeVideo}
                                                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-755 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                                                >
                                                    Add YouTube Video
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- RESOURCES (EXPANDED EXTENSIONS) --- */}
                                    <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 hover:border-emerald-450 transition duration-300">
                                        <h3 className="text-sm font-black text-emerald-600 mb-4 flex items-center gap-2 uppercase tracking-wide"><FileArchive size={16} /> Documents & Data</h3>
                                        <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-white hover:border-emerald-500 transition cursor-pointer group bg-white/50">
                                            <Plus className="mx-auto text-slate-400 mb-2 group-hover:text-emerald-600 transition group-hover:scale-125" size={24} />
                                            <p className="text-sm text-slate-650 font-bold">PDF, Excel, Docs, BibTeX, Zip</p>
                                            <input type="file" accept=".pdf,.doc,.docx,.bib,.txt,.xls,.xlsx,.csv,.ppt,.pptx,.zip" multiple onChange={handleResourceSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                        <div className="mt-4 space-y-3 max-h-56 overflow-y-auto custom-scrollbar pr-2">
                                            {resourceFiles.map((file, i) => (
                                                <div key={i} className="flex flex-col bg-white p-3 rounded-lg border border-slate-200 shadow-sm gap-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold text-emerald-750 truncate max-w-[80%] flex items-center gap-2"><Check size={12} className="text-emerald-500" /> {file.name}</span>
                                                        <button type="button" onClick={() => removeResource(i)} className="text-red-650 hover:text-red-500 bg-red-50 p-1.5 rounded"><Trash2 size={14} /></button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Document description / reading guide..."
                                                        value={resourceDescs[i] || ""}
                                                        onChange={(e) => setResourceDescs({ ...resourceDescs, [i]: e.target.value })}
                                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-450 outline-none"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* --- LINKS --- */}
                                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
                                    <h3 className="text-sm font-black text-purple-600 mb-4 flex items-center gap-2 uppercase tracking-wide"><LinkIcon size={16} /> Web Links & References</h3>
                                    <div className="flex flex-col gap-3 mb-4">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <input type="text" placeholder="Title (e.g. Official React Docs)" value={tempLinkTitle} onChange={(e) => setTempLinkTitle(e.target.value)}
                                                className="w-full sm:w-1/3 p-3 rounded-xl bg-white border border-slate-250 text-sm text-slate-800 focus:border-purple-500 outline-none font-medium" />
                                            <input type="url" placeholder="https://..." value={tempLinkUrl} onChange={(e) => setTempLinkUrl(e.target.value)}
                                                className="flex-1 p-3 rounded-xl bg-white border border-slate-250 text-sm text-slate-800 focus:border-purple-500 outline-none font-medium" />
                                        </div>
                                        <div className="flex gap-3">
                                            <input type="text" placeholder="Link description / article summary snippet..." value={tempLinkDesc} onChange={(e) => setTempLinkDesc(e.target.value)}
                                                className="flex-1 p-3 rounded-xl bg-white border border-slate-250 text-sm text-slate-800 focus:border-purple-500 outline-none font-medium" />
                                            <button type="button" onClick={addLink} className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl text-white text-sm font-bold shadow-md shadow-purple-100 transition whitespace-nowrap cursor-pointer">Add Link</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {links.map((link, i) => (
                                            <div key={i} className="text-sm text-slate-800 flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                                <div className="truncate max-w-[85%]">
                                                    <span className="font-bold text-purple-650">{link.title}</span>
                                                    <span className="text-slate-450 text-xs block truncate mt-0.5">{link.url}</span>
                                                </div>
                                                <button type="button" onClick={() => removeLink(i)} className="text-red-650 hover:text-red-500 bg-red-50 p-1.5 rounded"><X size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* --- PROGRESS BAR UI --- */}
                                {isUploading && (
                                    <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden border border-slate-200 relative shadow-inner">
                                        <div
                                            className="bg-gradient-to-r from-green-500 via-emerald-400 to-teal-450 h-full transition-all duration-300 ease-out flex items-center justify-center text-[10px] font-black text-slate-900"
                                            style={{ width: `${uploadProgress}%` }}
                                        >
                                            {uploadProgress}%
                                        </div>
                                    </div>
                                )}

                                <button type="submit" disabled={isUploading} className={`w-full py-5 rounded-xl font-black text-lg flex justify-center items-center gap-3 transition-all cursor-pointer ${isUploading ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-100 transform hover:-translate-y-1'}`}>
                                    {isUploading ? <Loader className="animate-spin" size={24} /> : <Plus size={24} />}
                                    {isUploading ? "Uploading Data to Cloud Server..." : "Finalize & Attach Module to Course"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default InstructorCoursePage;