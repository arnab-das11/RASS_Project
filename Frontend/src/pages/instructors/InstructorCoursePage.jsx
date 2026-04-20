import { useState } from "react";
import { 
  Upload, Plus, Link as LinkIcon, FileText, Video, Save, Loader, Home, 
  X, Check, Trash2, Image as ImageIcon, Clock, DollarSign, Tag, BookOpen, 
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
  const [resourceFiles, setResourceFiles] = useState([]); 
  const [links, setLinks] = useState([]); 
  
  // Temp Link Input State
  const [tempLinkTitle, setTempLinkTitle] = useState("");
  const [tempLinkUrl, setTempLinkUrl] = useState("");

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
      setLinks([...links, { title: tempLinkTitle, url: tempLinkUrl }]);
      setTempLinkTitle(""); setTempLinkUrl("");
    }
  };
  const removeLink = (index) => setLinks(links.filter((_, i) => i !== index));

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!createdCourseId) return alert("Course ID missing.");
    if (videoFiles.length === 0 && resourceFiles.length === 0 && links.length === 0) return alert("Add content first.");

    setIsUploading(true);
    setUploadProgress(0); 

    const formData = new FormData();
    formData.append("title", sectionTitle);
    videoFiles.forEach((file) => formData.append("videos", file));
    resourceFiles.forEach((file) => formData.append("resources", file));
    formData.append("links", JSON.stringify(links));

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
          videos: videoFiles.length, 
          resources: resourceFiles.length, 
          links: links.length 
      }]);

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
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#0f2744] to-[#132e53] p-6 md:p-10 relative text-slate-300 font-sans">
      
      {/* Top Navigation */}
      <button 
        onClick={() => navigate('/')} 
        className="fixed top-6 left-6 p-3 bg-[#112240]/80 backdrop-blur-md rounded-full shadow-2xl text-slate-400 hover:text-sky-400 border border-blue-800/30 transition-all hover:scale-110 z-50"
        title="Go Home"
      >
        <Home size={22} />
      </button>

      <div className="max-w-4xl mx-auto mt-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 tracking-tight mb-2">
                  Course Forge
                </h1>
                <p className="text-slate-400 font-medium">Design your curriculum and upload your educational assets.</p>
            </div>
            {createdCourseId && (
                <button onClick={() => navigate('/instructor-dashboard')} className="px-6 py-2.5 bg-blue-600/20 hover:bg-blue-600 border border-blue-500/50 hover:border-transparent text-blue-300 hover:text-white rounded-full font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2">
                    Complete Course <CheckCircle2 size={18}/>
                </button>
            )}
        </div>

        {/* ==================== STEP 1: COURSE DETAILS ==================== */}
        <div className={`bg-[#112240] rounded-3xl shadow-2xl p-8 mb-8 border border-blue-800/40 transition-all duration-500 ${createdCourseId ? 'opacity-50 pointer-events-none grayscale-[30%]' : 'opacity-100'}`}>
          <div className="flex items-center gap-4 mb-8 border-b border-blue-900/50 pb-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-10 h-10 flex items-center justify-center rounded-xl text-white font-black shadow-lg shadow-blue-900/50">1</div>
            <div>
                <h2 className="text-2xl font-bold text-sky-100">Course Blueprint</h2>
                <p className="text-xs text-sky-400/70 font-semibold uppercase tracking-wider">Define the landing page details</p>
            </div>
          </div>

          <form onSubmit={handleCreateCourse} className="space-y-8">
             
             {/* Title & Category */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                        <BookOpen size={16} className="text-sky-400"/> Course Title
                    </label>
                    <input type="text" placeholder="e.g. Master MERN Stack" 
                        className="w-full p-3.5 rounded-xl bg-[#0a192f] border border-blue-800/60 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition placeholder-slate-600 font-medium" 
                        value={courseData.title} onChange={(e) => setCourseData({...courseData, title: e.target.value})} required />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                        <Tag size={16} className="text-sky-400"/> Category
                    </label>
                    <select className="w-full p-3.5 rounded-xl bg-[#0a192f] border border-blue-800/60 text-white focus:border-sky-500 outline-none font-medium"
                        value={courseData.category} onChange={(e) => setCourseData({...courseData, category: e.target.value})}>
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
                <label className="block text-sm font-bold text-slate-300 mb-2">Description</label>
                <textarea placeholder="Write a compelling overview of the course..." rows="4" 
                    className="w-full p-4 rounded-xl bg-[#0a192f] border border-blue-800/60 text-white focus:border-sky-500 outline-none placeholder-slate-600 font-medium resize-none"
                    value={courseData.description} onChange={(e) => setCourseData({...courseData, description: e.target.value})} required />
             </div>

             {/* --- NEW: WHAT YOU'LL LEARN BUILDER --- */}
             <div className="bg-[#0a192f]/50 p-6 rounded-2xl border border-blue-900/30">
                <label className="block text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <ListChecks size={18} className="text-green-400"/> What will students learn?
                </label>
                <div className="space-y-3">
                    {courseData.learningObjectives.map((obj, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <GripVertical size={16} className="text-slate-600 cursor-grab active:cursor-grabbing"/>
                            <input 
                                type="text" 
                                placeholder={`Learning objective ${idx + 1}...`}
                                value={obj}
                                onChange={(e) => handleObjectiveChange(idx, e.target.value)}
                                className="flex-1 p-3 rounded-lg bg-[#0a192f] border border-blue-800/60 text-white focus:border-green-500 outline-none transition text-sm"
                            />
                            {courseData.learningObjectives.length > 1 && (
                                <button type="button" onClick={() => removeObjective(idx)} className="text-red-400 hover:text-red-300 p-2 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition">
                                    <Trash2 size={16}/>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addObjective} className="mt-4 flex items-center gap-2 text-sm font-bold text-green-400 hover:text-green-300 transition px-2">
                    <Plus size={16}/> Add another objective
                </button>
             </div>

             {/* GRID: Level, Duration, Price */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Difficulty</label>
                    <select className="w-full p-3.5 rounded-xl bg-[#0a192f] border border-blue-800/60 text-white focus:border-sky-500 outline-none font-medium"
                       value={courseData.level} onChange={(e) => setCourseData({...courseData, level: e.target.value})}>
                       <option>Beginner</option>
                       <option>Intermediate</option>
                       <option>Advanced</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                         <Clock size={16} className="text-sky-400"/> Duration (Hours)
                    </label>
                    <input type="number" placeholder="e.g. 2.5" min="0" step="0.1"
                        className="w-full p-3.5 rounded-xl bg-[#0a192f] border border-blue-800/60 text-white focus:border-sky-500 outline-none placeholder-slate-600 font-medium" 
                        value={courseData.duration} onChange={(e) => setCourseData({...courseData, duration: e.target.value})} required />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                         <DollarSign size={16} className="text-sky-400"/> Price
                    </label>
                    <input type="number" placeholder="0 for Free" min="0"
                        className="w-full p-3.5 rounded-xl bg-[#0a192f] border border-blue-800/60 text-white focus:border-sky-500 outline-none placeholder-slate-600 font-medium" 
                        value={courseData.price} onChange={(e) => setCourseData({...courseData, price: e.target.value})} />
                </div>
             </div>

             {/* Thumbnail Upload */}
             <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Thumbnail Image</label>
                <div className="border-2 border-dashed border-blue-600/50 rounded-2xl p-6 text-center hover:bg-[#1a2a44]/50 transition cursor-pointer relative flex flex-col items-center justify-center group h-48 bg-[#0a192f]/30">
                    {previewThumbnail ? (
                        <div className="relative h-full w-full flex justify-center">
                            <img src={previewThumbnail} alt="Preview" className="h-full object-cover rounded-xl shadow-lg border border-gray-700 w-full" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-all duration-300">
                                <span className="text-white text-sm font-bold flex items-center gap-2"><ImageIcon size={18}/> Replace Thumbnail</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="bg-blue-500/10 p-4 rounded-full mb-4 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                                <ImageIcon className="text-blue-400" size={36} />
                            </div>
                            <span className="text-sm text-slate-300 font-bold">Click or drag to upload cover image</span>
                            <span className="text-xs text-slate-500 mt-2 font-medium">Recommended: 1280x720 (16:9)</span>
                        </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleThumbnailChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
             </div>

             {!createdCourseId && (
                <button type="submit" disabled={loadingCourse} className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black text-lg flex justify-center items-center gap-3 transition-all shadow-xl shadow-blue-900/40 transform hover:-translate-y-1">
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
                 <div className="bg-[#112240] rounded-3xl shadow-xl p-8 border border-green-800/40">
                     <h3 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-2"><CheckCircle2/> Built Curriculum ({addedSections.length} Sections)</h3>
                     <div className="space-y-3">
                         {addedSections.map((sec, idx) => (
                             <div key={idx} className="flex items-center justify-between bg-[#0a192f] p-4 rounded-xl border border-blue-900/50">
                                 <span className="font-bold text-sky-100 flex items-center gap-3">
                                     <div className="bg-blue-900/50 w-6 h-6 rounded flex items-center justify-center text-xs text-blue-300">{idx+1}</div>
                                     {sec.title}
                                 </span>
                                 <div className="flex gap-4 text-xs font-bold text-slate-400">
                                     <span className="flex items-center gap-1"><Video size={14}/> {sec.videos}</span>
                                     <span className="flex items-center gap-1"><FileText size={14}/> {sec.resources}</span>
                                     <span className="flex items-center gap-1"><LinkIcon size={14}/> {sec.links}</span>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
              )}

              {/* --- SECTION BUILDER FORM --- */}
              <div className="bg-[#112240] rounded-3xl shadow-2xl p-8 border border-blue-800/40 relative">
                 <div className="absolute -top-8 left-12 w-1 h-8 bg-gradient-to-b from-blue-600 to-[#112240]"></div>

                 <div className="flex justify-between items-center mb-8 border-b border-blue-900/50 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-green-400 to-emerald-600 w-10 h-10 flex items-center justify-center rounded-xl text-white font-black shadow-lg shadow-green-900/50">2</div>
                      <div>
                          <h2 className="text-2xl font-bold text-sky-100">Content Modules</h2>
                          <p className="text-xs text-sky-400/70 font-semibold uppercase tracking-wider">Upload lectures & resources</p>
                      </div>
                    </div>
                 </div>

                 <form onSubmit={handleAddSection} className="space-y-8">
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Module Title</label>
                        <input type="text" placeholder="e.g. Chapter 1: Foundations of JavaScript" 
                            className="w-full p-4 rounded-xl bg-[#0a192f] border border-blue-800/60 text-white focus:border-green-500 outline-none placeholder-slate-600 font-medium shadow-inner" 
                        value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* --- VIDEOS --- */}
                        <div className="border border-blue-800/40 rounded-2xl p-5 bg-[#0a192f]/60 hover:border-blue-500/50 transition duration-300">
                            <h3 className="text-sm font-black text-sky-300 mb-4 flex items-center gap-2 uppercase tracking-wide"><Video size={16}/> Video Lectures</h3>
                            <div className="relative border-2 border-dashed border-slate-600/50 rounded-xl p-6 text-center hover:bg-[#1a2a44] hover:border-sky-400 transition cursor-pointer group">
                                <Plus className="mx-auto text-slate-500 mb-2 group-hover:text-sky-400 transition group-hover:scale-125" size={24}/>
                                <p className="text-sm text-slate-400 font-bold">Select Video Files</p>
                                <input type="file" accept="video/*" multiple onChange={handleVideoSelect} className="absolute inset-0 opacity-0 cursor-pointer"/>
                            </div>
                            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                {videoFiles.map((file, i) => (
                                    <div key={i} className="flex justify-between items-center bg-[#112240] p-3 rounded-lg border border-blue-900/30 shadow-sm">
                                        <span className="text-xs font-bold text-sky-300 truncate max-w-[80%] flex items-center gap-2"><Check size={12}/> {file.name}</span>
                                        <button type="button" onClick={() => removeVideo(i)} className="text-red-400 hover:text-red-300 bg-red-400/10 p-1.5 rounded"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* --- RESOURCES (EXPANDED EXTENSIONS) --- */}
                        <div className="border border-blue-800/40 rounded-2xl p-5 bg-[#0a192f]/60 hover:border-green-500/50 transition duration-300">
                            <h3 className="text-sm font-black text-emerald-300 mb-4 flex items-center gap-2 uppercase tracking-wide"><FileArchive size={16}/> Documents & Data</h3>
                            <div className="relative border-2 border-dashed border-slate-600/50 rounded-xl p-6 text-center hover:bg-[#1a2a44] hover:border-emerald-400 transition cursor-pointer group">
                                <Plus className="mx-auto text-slate-500 mb-2 group-hover:text-emerald-400 transition group-hover:scale-125" size={24}/>
                                <p className="text-sm text-slate-400 font-bold">PDF, Excel, Docs, BibTeX, Zip</p>
                                {/* NEW: Expanded Accept attribute to handle Excel, PPT, etc. */}
                                <input type="file" accept=".pdf,.doc,.docx,.bib,.txt,.xls,.xlsx,.csv,.ppt,.pptx,.zip" multiple onChange={handleResourceSelect} className="absolute inset-0 opacity-0 cursor-pointer"/>
                            </div>
                            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                {resourceFiles.map((file, i) => (
                                    <div key={i} className="flex justify-between items-center bg-[#112240] p-3 rounded-lg border border-blue-900/30 shadow-sm">
                                        <span className="text-xs font-bold text-emerald-400 truncate max-w-[80%] flex items-center gap-2"><Check size={12}/> {file.name}</span>
                                        <button type="button" onClick={() => removeResource(i)} className="text-red-400 hover:text-red-300 bg-red-400/10 p-1.5 rounded"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- LINKS --- */}
                    <div className="border border-blue-800/40 rounded-2xl p-5 bg-[#0a192f]/60">
                        <h3 className="text-sm font-black text-purple-300 mb-4 flex items-center gap-2 uppercase tracking-wide"><LinkIcon size={16}/> Web Links & References</h3>
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                            <input type="text" placeholder="Title (e.g. Official React Docs)" value={tempLinkTitle} onChange={(e)=>setTempLinkTitle(e.target.value)} 
                                className="w-full sm:w-1/3 p-3 rounded-xl bg-[#112240] border border-blue-800/60 text-sm text-white focus:border-purple-500 outline-none font-medium"/>
                            <input type="url" placeholder="https://..." value={tempLinkUrl} onChange={(e)=>setTempLinkUrl(e.target.value)} 
                                className="flex-1 p-3 rounded-xl bg-[#112240] border border-blue-800/60 text-sm text-white focus:border-purple-500 outline-none font-medium"/>
                            <button type="button" onClick={addLink} className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl text-white text-sm font-bold shadow-lg shadow-purple-900/30 transition">Add Link</button>
                        </div>
                        <div className="space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {links.map((link, i) => (
                                <div key={i} className="text-sm text-slate-300 flex justify-between items-center bg-[#112240] p-3 rounded-lg border border-blue-900/30 shadow-sm">
                                    <div className="truncate max-w-[85%]">
                                        <span className="font-bold text-purple-300">{link.title}</span>
                                        <span className="text-slate-500 text-xs block truncate mt-0.5">{link.url}</span>
                                    </div>
                                    <button type="button" onClick={() => removeLink(i)} className="text-red-400 hover:text-red-300 bg-red-400/10 p-1.5 rounded"><X size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- PROGRESS BAR UI --- */}
                    {isUploading && (
                        <div className="w-full bg-[#0a192f] rounded-full h-5 overflow-hidden border border-blue-900/50 relative shadow-inner">
                            <div 
                               className="bg-gradient-to-r from-green-500 via-emerald-400 to-teal-400 h-full transition-all duration-300 ease-out flex items-center justify-center text-[10px] font-black text-slate-900" 
                               style={{ width: `${uploadProgress}%` }}
                            >
                               {uploadProgress}%
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={isUploading} className={`w-full py-5 rounded-xl font-black text-lg flex justify-center items-center gap-3 transition-all ${isUploading ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-xl shadow-green-900/30 transform hover:-translate-y-1'}`}>
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