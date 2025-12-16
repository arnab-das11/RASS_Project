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
  Image as ImageIcon 
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
    category: "Development",
    level: "Beginner",
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
  const [loadingLecture, setLoadingLecture] = useState(false);

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
    
    // Check User Auth
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) return alert("Please log in first.");

    setLoadingCourse(true);

    const formData = new FormData();
    formData.append("title", courseData.title);
    formData.append("description", courseData.description);
    formData.append("category", courseData.category);
    formData.append("level", courseData.level);
    formData.append("thumbnail", thumbnail);
    formData.append("instructorId", userInfo._id);

    try {
      const { data } = await axios.post("http://localhost:5000/api/courses", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCreatedCourseId(data._id);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      alert("Error creating course.");
    } finally {
      setLoadingCourse(false);
    }
  };

  // ==================== HANDLERS: STEP 2 (SECTIONS) ====================

  // Video Handlers
  const handleVideoSelect = (e) => {
    const files = Array.from(e.target.files);
    setVideoFiles((prev) => [...prev, ...files]);
  };
  const removeVideo = (index) => {
    setVideoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Resource Handlers
  const handleResourceSelect = (e) => {
    const files = Array.from(e.target.files);
    setResourceFiles((prev) => [...prev, ...files]);
  };
  const removeResource = (index) => {
    setResourceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Link Handlers
  const addLink = () => {
    if (tempLinkTitle && tempLinkUrl) {
      setLinks([...links, { title: tempLinkTitle, url: tempLinkUrl }]);
      setTempLinkTitle("");
      setTempLinkUrl("");
    }
  };
  const removeLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  // Submit Section
  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!createdCourseId) return alert("Course ID missing. Please create course first.");
    
    if (videoFiles.length === 0 && resourceFiles.length === 0 && links.length === 0) {
        return alert("Please add at least one video, resource, or link.");
    }

    setLoadingLecture(true);
    const formData = new FormData();
    formData.append("title", sectionTitle);
    
    videoFiles.forEach((file) => formData.append("videos", file));
    resourceFiles.forEach((file) => formData.append("resources", file));
    formData.append("links", JSON.stringify(links));

    try {
      await axios.post(`http://localhost:5000/api/courses/${createdCourseId}/lectures`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Section Added Successfully!");
      
      // Reset Section Fields
      setSectionTitle("");
      setVideoFiles([]);
      setResourceFiles([]);
      setLinks([]);
    } catch (error) {
      console.error(error);
      alert("Failed to upload. Check file sizes.");
    } finally {
      setLoadingLecture(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#0f2744] to-[#132e53] p-6 md:p-10 relative text-slate-300">
      
      {/* Home Button */}
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
                    <label className="block text-sm font-medium text-slate-300 mb-1">Course Title</label>
                    <input type="text" placeholder="e.g. Advanced React Patterns" 
                        className="w-full p-3 rounded-xl bg-[#1a2a44] border border-blue-800 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition" 
                        value={courseData.title} onChange={(e) => setCourseData({...courseData, title: e.target.value})} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                    <select className="w-full p-3 rounded-xl bg-[#1a2a44] border border-blue-800 text-white focus:border-sky-500 outline-none"
                        value={courseData.category} onChange={(e) => setCourseData({...courseData, category: e.target.value})}>
                        <option>Development</option>
                        <option>Business</option>
                        <option>Design</option>
                        <option>Marketing</option>
                    </select>
                </div>
             </div>

             {/* Description */}
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea placeholder="What will students learn in this course?" rows="3" 
                    className="w-full p-3 rounded-xl bg-[#1a2a44] border border-blue-800 text-white focus:border-sky-500 outline-none"
                    value={courseData.description} onChange={(e) => setCourseData({...courseData, description: e.target.value})} required />
             </div>

             {/* Thumbnail & Level */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Thumbnail Image</label>
                    <div className="border-2 border-dashed border-blue-700/50 rounded-xl p-4 text-center hover:bg-[#1a2a44] transition cursor-pointer relative h-32 flex flex-col items-center justify-center group">
                        {previewThumbnail ? (
                            <img src={previewThumbnail} alt="Preview" className="h-full object-contain rounded-lg" />
                        ) : (
                            <>
                                <ImageIcon className="text-slate-500 mb-2 group-hover:text-sky-400" />
                                <span className="text-xs text-slate-400">Click to upload image</span>
                            </>
                        )}
                        <input type="file" accept="image/*" onChange={handleThumbnailChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty Level</label>
                    <select className="w-full p-3 rounded-xl bg-[#1a2a44] border border-blue-800 text-white focus:border-sky-500 outline-none"
                       value={courseData.level} onChange={(e) => setCourseData({...courseData, level: e.target.value})}>
                       <option>Beginner</option>
                       <option>Intermediate</option>
                       <option>Advanced</option>
                    </select>
                </div>
             </div>

             {/* Submit Step 1 */}
             {!createdCourseId && (
                <button type="submit" disabled={loadingCourse} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-900/50">
                   {loadingCourse ? <Loader className="animate-spin" /> : <Save size={20} />}
                   {loadingCourse ? "Creating Draft..." : "Save & Continue to Curriculum"}
                </button>
             )}
          </form>
        </div>

        {/* ==================== STEP 2: MULTI-CONTENT UPLOAD ==================== */}
        {createdCourseId && (
          <div className="bg-[#112240] rounded-2xl shadow-xl p-8 border border-blue-800/50 animate-fade-in relative">
             <div className="absolute -top-8 left-8 w-0.5 h-8 bg-blue-800/50"></div>

             <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 w-8 h-8 flex items-center justify-center rounded-full text-green-400 font-bold border border-green-500/30">2</div>
                  <h2 className="text-xl font-semibold text-sky-100">Add Course Section</h2>
                </div>
             </div>

             <form onSubmit={handleAddSection} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Section Title</label>
                    <input type="text" placeholder="e.g. Chapter 1: Introduction & Resources" 
                        className="w-full p-3 rounded-xl bg-[#1a2a44] border border-blue-800 text-white focus:border-green-500 outline-none" 
                    value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* --- VIDEOS --- */}
                    <div className="border border-blue-800/50 rounded-xl p-4 bg-[#0a192f]/50">
                        <h3 className="text-sm font-bold text-sky-200 mb-3 flex items-center gap-2"><Video size={16}/> Videos</h3>
                        
                        {/* Upload Zone */}
                        <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:bg-[#1a2a44] hover:border-green-500 transition cursor-pointer">
                            <p className="text-xs text-slate-400">+ Add Video Files</p>
                            <input type="file" accept="video/*" multiple onChange={handleVideoSelect} className="absolute inset-0 opacity-0 cursor-pointer"/>
                        </div>

                        {/* File List */}
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
                        
                        {/* Upload Zone */}
                        <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:bg-[#1a2a44] hover:border-blue-500 transition cursor-pointer">
                            <p className="text-xs text-slate-400">+ Add PDF/Docs/BibTex</p>
                            <input type="file" accept=".pdf,.doc,.docx,.bib,.txt" multiple onChange={handleResourceSelect} className="absolute inset-0 opacity-0 cursor-pointer"/>
                        </div>

                        {/* File List */}
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

                {/* Submit Section */}
                <button type="submit" disabled={loadingLecture} className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-900/40 flex justify-center items-center gap-2 transition-all transform hover:-translate-y-0.5">
                   {loadingLecture ? <Loader className="animate-spin" /> : <Plus size={20} />}
                   {loadingLecture ? "Uploading Content (This may take time)..." : "Add This Section to Course"}
                </button>
             </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default InstructorCoursePage;