import { useState } from "react";
import { 
  Upload, 
  Plus, 
  Link as LinkIcon, 
  FileText, 
  Video, 
  Save, 
  Loader, 
  Home, 
  X, 
  Check, 
  Trash2, 
  Image as ImageIcon,
  Clock,
  DollarSign,
  Tag,
  BookOpen
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
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [previewThumbnail, setPreviewThumbnail] = useState(null);
  const [createdCourseId, setCreatedCourseId] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(false);

  // --- Step 2: Section Content State ---
  const [sectionTitle, setSectionTitle] = useState("");
  const [videoFiles, setVideoFiles] = useState([]); 
  const [resourceFiles, setResourceFiles] = useState([]); 
  const [links, setLinks] = useState([]); 
  
  // Temp Link Input State
  const [tempLinkTitle, setTempLinkTitle] = useState("");
  const [tempLinkUrl, setTempLinkUrl] = useState("");

  // --- NEW: UPLOAD PROGRESS STATE ---
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // ==================== HANDLERS: STEP 1 (COURSE) ====================

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setPreviewThumbnail(URL.createObjectURL(file));
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!thumbnail) return alert("Please upload a course thumbnail.");
    
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
      setLinks([...links, { title: tempLinkTitle, url: tempLinkUrl }]);
      setTempLinkTitle(""); setTempLinkUrl("");
    }
  };
  const removeLink = (index) => setLinks(links.filter((_, i) => i !== index));

  // --- UPDATED SUBMIT HANDLER WITH PROGRESS ---
  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!createdCourseId) return alert("Course ID missing.");
    if (videoFiles.length === 0 && resourceFiles.length === 0 && links.length === 0) return alert("Add content first.");

    setIsUploading(true);
    setUploadProgress(0); // Reset progress

    const formData = new FormData();
    formData.append("title", sectionTitle);
    videoFiles.forEach((file) => formData.append("videos", file));
    resourceFiles.forEach((file) => formData.append("resources", file));
    formData.append("links", JSON.stringify(links));

    try {
      await axios.post(`http://localhost:5000/api/courses/${createdCourseId}/lectures`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        // AXIOS PROGRESS EVENT
        onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
        }
      });
      
      alert("Section Added Successfully!");
      // Reset form
      setSectionTitle(""); setVideoFiles([]); setResourceFiles([]); setLinks([]);
    } catch (error) {
      console.error(error);
      alert("Failed to upload. Check file sizes or connection.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#0f2744] to-[#132e53] p-6 md:p-10 relative text-slate-300">
      
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-6 left-6 p-2 bg-[#112240] rounded-full shadow-lg text-slate-400 hover:text-sky-400 border border-blue-800/30 transition z-10"
        title="Go Home"
      >
        <Home size={24} />
      </button>

      <div className="max-w-4xl mx-auto mt-8">
        
        <div className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">
                  Course Builder
                </h1>
                <p className="text-slate-400 mt-1">Step 1: Define Course. Step 2: Add Curriculum.</p>
            </div>
            {createdCourseId && (
                <button onClick={() => navigate('/instructor-dashboard')} className="text-sm font-medium text-sky-400 hover:text-sky-300 underline">
                    Finish & Go to Dashboard &rarr;
                </button>
            )}
        </div>

        {/* ==================== STEP 1: COURSE DETAILS ==================== */}
        <div className={`bg-[#112240] rounded-2xl shadow-xl p-8 mb-8 border border-blue-800/50 transition-all duration-300 ${createdCourseId ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-500/20 w-8 h-8 flex items-center justify-center rounded-full text-blue-300 font-bold border border-blue-500/30">1</div>
            <h2 className="text-xl font-semibold text-sky-100">Course Information</h2>
          </div>

          <form onSubmit={handleCreateCourse} className="space-y-6">
             
             {/* Title & Category */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                        <BookOpen size={16} className="text-sky-400"/> Course Title
                    </label>
                    <input type="text" placeholder="e.g. Master MERN Stack" 
                        className="w-full p-3 rounded-xl bg-[#1a2a44] border border-blue-800 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition placeholder-slate-500" 
                        value={courseData.title} onChange={(e) => setCourseData({...courseData, title: e.target.value})} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                        <Tag size={16} className="text-sky-400"/> Category
                    </label>
                    <select className="w-full p-3 rounded-xl bg-[#1a2a44] border border-blue-800 text-white focus:border-sky-500 outline-none"
                        value={courseData.category} onChange={(e) => setCourseData({...courseData, category: e.target.value})}>
                        <option value="Web Development">Web Development</option>
                        <option value="Data Structures & Algorithms">Data Structures & Algorithms (DSA)</option>
                        <option value="Artificial Intelligence">Artificial Intelligence (AI/ML)</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                        <option value="Cloud Computing">Cloud Computing</option>
                        <option value="Mobile Development">Mobile Development</option>
                        <option value="Data Science">Data Science</option>
                        <option value="DevOps">DevOps</option>
                    </select>
                </div>
             </div>

             {/* Description */}
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea placeholder="Write a catchy description. What will students learn?" rows="4" 
                    className="w-full p-3 rounded-xl bg-[#1a2a44] border border-blue-800 text-white focus:border-sky-500 outline-none placeholder-slate-500"
                    value={courseData.description} onChange={(e) => setCourseData({...courseData, description: e.target.value})} required />
             </div>

             {/* GRID: Level, Duration, Price */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                    <select className="w-full p-3 rounded-xl bg-[#1a2a44] border border-blue-800 text-white focus:border-sky-500 outline-none"
                       value={courseData.level} onChange={(e) => setCourseData({...courseData, level: e.target.value})}>
                       <option>Beginner</option>
                       <option>Intermediate</option>
                       <option>Advanced</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                         <Clock size={16} className="text-sky-400"/> Duration (Hours)
                    </label>
                    <input type="number" placeholder="e.g. 2.5" min="0" step="0.1"
                        className="w-full p-3 rounded-xl bg-[#1a2a44] border border-blue-800 text-white focus:border-sky-500 outline-none placeholder-slate-500" 
                        value={courseData.duration} onChange={(e) => setCourseData({...courseData, duration: e.target.value})} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                         <DollarSign size={16} className="text-sky-400"/> Price
                    </label>
                    <input type="number" placeholder="0 for Free" min="0"
                        className="w-full p-3 rounded-xl bg-[#1a2a44] border border-blue-800 text-white focus:border-sky-500 outline-none placeholder-slate-500" 
                        value={courseData.price} onChange={(e) => setCourseData({...courseData, price: e.target.value})} />
                </div>
             </div>

             {/* Thumbnail Upload */}
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Thumbnail Image</label>
                <div className="border-2 border-dashed border-blue-700/50 rounded-xl p-6 text-center hover:bg-[#1a2a44] transition cursor-pointer relative flex flex-col items-center justify-center group h-40">
                    {previewThumbnail ? (
                        <div className="relative h-full w-full flex justify-center">
                            <img src={previewThumbnail} alt="Preview" className="h-full object-contain rounded-lg shadow-lg" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition">
                                <span className="text-white text-sm font-bold">Change Image</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="bg-blue-500/10 p-3 rounded-full mb-3 group-hover:scale-110 transition">
                                <ImageIcon className="text-blue-400" size={32} />
                            </div>
                            <span className="text-sm text-slate-300 font-medium">Click to upload course thumbnail</span>
                            <span className="text-xs text-slate-500 mt-1">Recommended size: 1280x720</span>
                        </>
                    )}
                    <input type="file" accept="image/*" onChange={handleThumbnailChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
             </div>

             {!createdCourseId && (
                <button type="submit" disabled={loadingCourse} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-900/50 transform hover:-translate-y-0.5">
                   {loadingCourse ? <Loader className="animate-spin" /> : <Save size={20} />}
                   {loadingCourse ? "Creating Draft & Setting up Cloud..." : "Save Details & Continue to Curriculum"}
                </button>
             )}
          </form>
        </div>

        {/* ==================== STEP 2: MULTI-CONTENT UPLOAD ==================== */}
        {createdCourseId && (
          <div className="bg-[#112240] rounded-2xl shadow-xl p-8 border border-blue-800/50 animate-fade-in relative mb-20">
             <div className="absolute -top-8 left-8 w-0.5 h-8 bg-blue-800/50"></div>

             <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 w-8 h-8 flex items-center justify-center rounded-full text-green-400 font-bold border border-green-500/30">2</div>
                  <h2 className="text-xl font-semibold text-sky-100">Add Course Section</h2>
                </div>
                <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Multiple Files Supported</span>
             </div>

             <form onSubmit={handleAddSection} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Section Title</label>
                    <input type="text" placeholder="e.g. Chapter 1: Introduction & Resources" 
                        className="w-full p-3 rounded-xl bg-[#1a2a44] border border-blue-800 text-white focus:border-green-500 outline-none placeholder-slate-500" 
                    value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* --- VIDEOS --- */}
                    <div className="border border-blue-800/50 rounded-xl p-4 bg-[#0a192f]/50">
                        <h3 className="text-sm font-bold text-sky-200 mb-3 flex items-center gap-2"><Video size={16}/> Videos</h3>
                        <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:bg-[#1a2a44] hover:border-green-500 transition cursor-pointer">
                            <p className="text-xs text-slate-400 font-medium">+ Drop Video Files</p>
                            <input type="file" accept="video/*" multiple onChange={handleVideoSelect} className="absolute inset-0 opacity-0 cursor-pointer"/>
                        </div>
                        <div className="mt-3 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                            {videoFiles.map((file, i) => (
                                <div key={i} className="flex justify-between items-center bg-[#1a2a44] p-2 rounded border border-blue-900/50">
                                    <span className="text-xs text-green-400 truncate max-w-[80%] flex items-center gap-1"><Check size={10}/> {file.name}</span>
                                    <button type="button" onClick={() => removeVideo(i)} className="text-red-400 hover:text-red-300"><Trash2 size={12}/></button>
                                </div>
                            ))}
                            {videoFiles.length === 0 && <p className="text-xs text-gray-500 text-center mt-2">No videos selected</p>}
                        </div>
                    </div>

                    {/* --- RESOURCES --- */}
                    <div className="border border-blue-800/50 rounded-xl p-4 bg-[#0a192f]/50">
                        <h3 className="text-sm font-bold text-sky-200 mb-3 flex items-center gap-2"><FileText size={16}/> Resources</h3>
                        <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:bg-[#1a2a44] hover:border-blue-500 transition cursor-pointer">
                            <p className="text-xs text-slate-400 font-medium">+ Drop PDF/Docs</p>
                            <input type="file" accept=".pdf,.doc,.docx,.bib,.txt" multiple onChange={handleResourceSelect} className="absolute inset-0 opacity-0 cursor-pointer"/>
                        </div>
                        <div className="mt-3 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                            {resourceFiles.map((file, i) => (
                                <div key={i} className="flex justify-between items-center bg-[#1a2a44] p-2 rounded border border-blue-900/50">
                                    <span className="text-xs text-sky-400 truncate max-w-[80%] flex items-center gap-1"><Check size={10}/> {file.name}</span>
                                    <button type="button" onClick={() => removeResource(i)} className="text-red-400 hover:text-red-300"><Trash2 size={12}/></button>
                                </div>
                            ))}
                            {resourceFiles.length === 0 && <p className="text-xs text-gray-500 text-center mt-2">No resources selected</p>}
                        </div>
                    </div>
                </div>

                {/* --- LINKS --- */}
                <div className="border border-blue-800/50 rounded-xl p-4 bg-[#0a192f]/50">
                    <h3 className="text-sm font-bold text-sky-200 mb-3 flex items-center gap-2"><LinkIcon size={16}/> External Links</h3>
                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                        <input type="text" placeholder="Title (e.g. Wiki)" value={tempLinkTitle} onChange={(e)=>setTempLinkTitle(e.target.value)} 
                            className="w-full sm:w-1/3 p-2 rounded-lg bg-[#1a2a44] border border-blue-800 text-sm text-white focus:border-sky-500 outline-none"/>
                        <input type="url" placeholder="URL (https://...)" value={tempLinkUrl} onChange={(e)=>setTempLinkUrl(e.target.value)} 
                            className="flex-1 p-2 rounded-lg bg-[#1a2a44] border border-blue-800 text-sm text-white focus:border-sky-500 outline-none"/>
                        <button type="button" onClick={addLink} className="bg-blue-600 px-4 py-2 rounded-lg text-white text-sm hover:bg-blue-500 font-medium">Add</button>
                    </div>
                    <div className="space-y-2">
                        {links.map((link, i) => (
                            <div key={i} className="text-sm text-slate-300 flex justify-between items-center bg-[#1a2a44] p-2 rounded border border-blue-900/50">
                                <span className="flex items-center gap-2"><LinkIcon size={12} className="text-purple-400"/> {link.title}: <span className="text-slate-500 text-xs">{link.url}</span></span>
                                <button type="button" onClick={() => removeLink(i)} className="text-red-400 hover:text-red-300"><X size={14}/></button>
                            </div>
                        ))}
                        {links.length === 0 && <p className="text-xs text-gray-500 text-center">No links added</p>}
                    </div>
                </div>

                {/* --- PROGRESS BAR UI --- */}
                {isUploading && (
                    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-600 relative mb-4">
                        <div 
                           className="bg-gradient-to-r from-green-500 to-emerald-400 h-full transition-all duration-300 ease-out flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                           style={{ width: `${uploadProgress}%` }}
                        >
                           {uploadProgress}%
                        </div>
                    </div>
                )}

                <button type="submit" disabled={isUploading} className={`w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${isUploading ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white hover:shadow-lg'}`}>
                   {isUploading ? <Loader className="animate-spin" /> : <Plus size={20} />}
                   {isUploading ? "Uploading to Cloud..." : "Add This Section to Course"}
                </button>
             </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default InstructorCoursePage;