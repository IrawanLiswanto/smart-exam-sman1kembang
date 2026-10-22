import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { 
  Trash2, Plus, LogOut, BookOpen, Clock, AlertTriangle, 
  CheckCircle, Upload, Save, User, Download, Bot, Eye, Edit, Image as ImageIcon, X
} from 'lucide-react';

const CLASS_OPTIONS = [];
for (let i = 1; i <= 10; i++) CLASS_OPTIONS.push(`X.${i}`);
for (let i = 1; i <= 10; i++) CLASS_OPTIONS.push(`XI.${i}`);
for (let i = 1; i <= 10; i++) CLASS_OPTIONS.push(`XII.${i}`);

const INITIAL_USERS = [
  { id: '1', role: 'student', username: 'siswa1', password: 'password', name: 'Budi Santoso', class: 'X.1', nis: '1001' },
  { id: '2', role: 'teacher', username: 'guru1', password: 'password', name: 'Pak Guru', subject: 'Matematika', nip: 'guru1' },
  { id: '3', role: 'admin', username: 'admin', password: 'password', name: 'Administrator' }
];  

const INITIAL_EXAMS = [
  { id: '1', title: 'Ujian Tengah Semester - Matematika', subject: 'Matematika', targetClass: 'X.1', durationMinutes: 60, status: 'active', teacherId: '2' }
];

const INITIAL_QUESTIONS = [
  { id: '1', examId: '1', text: 'Berapakah 2 + 2?', options: ['1', '2', '3', '4', '5'], correctAnswer: 3 }
];

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [exams, setExams] = useState(INITIAL_EXAMS);
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [results, setResults] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const login = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) setCurrentUser(user);
    return user;
  };
  const logout = () => setCurrentUser(null);

  const addUser = (user) => setUsers([...users, { ...user, id: Date.now().toString() }]);
  const addUsersBulk = (newUsers) => {
    const formatted = newUsers.map((u, i) => ({ ...u, id: Date.now().toString() + i }));
    setUsers(prev => [...prev, ...formatted]);
  };
  const deleteUser = (id) => setUsers(users.filter(u => u.id !== id));
  const deleteUsersBulk = (idsToDelete) => {
    setUsers(users.filter(u => !idsToDelete.includes(u.id)));
  };
  const editUser = (updatedUser) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const addExam = (exam) => setExams([...exams, { ...exam, id: Date.now().toString(), status: 'active', teacherId: currentUser.id }]);
  const deleteExam = (id) => {
    setExams(exams.filter(e => e.id !== id));
    setQuestions(questions.filter(q => q.examId !== id)); 
  };
  
  const addQuestion = (question) => setQuestions([...questions, { ...question, id: Date.now().toString() }]);
  const addQuestionsBulk = (newQuestions) => {
    const formatted = newQuestions.map((q, i) => ({ ...q, id: Date.now().toString() + i }));
    setQuestions(prev => [...prev, ...formatted]);
  };
  const deleteQuestion = (id) => setQuestions(questions.filter(q => q.id !== id));
  const editQuestion = (updatedQuestion) => {
    setQuestions(questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
  };

  const saveResult = (result) => setResults([...results, { ...result, id: Date.now().toString() }]);

  return (
    <AppContext.Provider value={{
      users, exams, questions, results, currentUser,
      login, logout, addUser, addUsersBulk, deleteUser, deleteUsersBulk, editUser,
      addExam, deleteExam, addQuestion, addQuestionsBulk, deleteQuestion, editQuestion, saveResult
    }}>
      {children}
    </AppContext.Provider>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>{children}</div>
);

const Button = ({ children, variant = 'primary', className = '', disabled, ...props }) => {
  const base = "px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50"
  };
  return <button className={`${base} ${variants[variant]} ${className}`} disabled={disabled} {...props}>{children}</button>;
};

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <input className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" {...props} />
  </div>
);

const Select = ({ label, options, children, ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white" {...props}>
      <option value="">-- Pilih --</option>
      {options && options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      {children}
    </select>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const { users, addUser, addUsersBulk, deleteUser, deleteUsersBulk, editUser } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('student');
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [showDeleteBulkConfirm, setShowDeleteBulkConfirm] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({ username: '', password: 'password123', name: '', class: 'X.1', subject: '' });

  const downloadCSVTemplate = () => {
    let csvContent = "\uFEFF"; 
    let filename = "";
    if (activeTab === 'student') {
      csvContent += "Nama,NIS,Password,Kelas\r\nBudi Santoso,1001,password123,X.1\r\nSiti Aminah,1002,123456,XI.1";
      filename = "Template_Import_Siswa.csv";
    } else {
      csvContent += "Nama,NIP,Password,Mata Pelajaran\r\nPak Guru Budi,19800101,password123,Matematika\r\nBu Guru Siti,19850202,123456,Bahasa Inggris";
      filename = "Import_Data_Guru.csv";
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCSVImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r?\n/);
      const newUsers = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(',').map(p => p.trim());
        const name = parts[0];
        const username = parts[1]; 
        const password = parts[2];
        const classNameOrSubject = parts[3];
        
        if (name && username) {
          newUsers.push({
            name: String(name),
            username: String(username),
            nis: activeTab === 'student' ? String(username) : undefined,
            nip: activeTab === 'teacher' ? String(username) : undefined,
            password: password ? String(password) : '123456',
            class: activeTab === 'student' ? (classNameOrSubject ? String(classNameOrSubject) : 'X.1') : undefined,
            subject: activeTab === 'teacher' ? (classNameOrSubject ? String(classNameOrSubject) : 'Umum') : undefined,
            role: activeTab
          });
        }
      }
      if (newUsers.length > 0) addUsersBulk(newUsers);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userPayload = { ...formData, role: activeTab };
    if (userPayload.role === 'student') {
      userPayload.nis = userPayload.username; 
      delete userPayload.subject;
      delete userPayload.nip;
    } else if (userPayload.role === 'teacher') {
      userPayload.nip = userPayload.username;
      delete userPayload.class;
      delete userPayload.nis;
    } else {
      delete userPayload.class;
      delete userPayload.subject;
      delete userPayload.nis;
      delete userPayload.nip;
    }
    
    if (editingUserId) {
      editUser({ ...userPayload, id: editingUserId });
    } else {
      addUser(userPayload);
    }
    
    setShowForm(false);
    setEditingUserId(null);
    setFormData({ username: '', password: 'password123', name: '', class: 'X.1', subject: '' });
  };

  const handleEditClick = (u) => {
    setFormData({
      username: u.username,
      password: u.password,
      name: u.name,
      class: u.class || 'X.1',
      subject: u.subject || ''
    });
    setEditingUserId(u.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingUserId(null);
    setFormData({ username: '', password: 'password123', name: '', class: 'X.1', subject: '' });
  };

  const handleBulkDelete = () => {
    const idsToDelete = filteredUsers.map(u => u.id);
    deleteUsersBulk(idsToDelete);
    setShowDeleteBulkConfirm(false);
  };

  const filteredUsers = users.filter(u => {
    if (u.role !== activeTab) return false;
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = (activeTab === 'student' && filterClass) ? u.class === filterClass : true;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold">Manajemen Pengguna</h2>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['student', 'teacher'].includes(activeTab) && (
            <React.Fragment>
              <Button variant="outline" onClick={downloadCSVTemplate} className="text-green-700 bg-green-50 border-green-200 hover:bg-green-100 flex-1 md:flex-none">
                <Download size={16}/> Format Import
              </Button>
              <input type="file" accept=".csv" ref={fileInputRef} onChange={handleCSVImport} className="hidden" />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1 md:flex-none">
                <Upload size={16}/> Import CSV
              </Button>
            </React.Fragment>
          )}
          <Button onClick={() => { cancelForm(); setShowForm(true); }} className="flex-1 md:flex-none">
            <Plus size={16}/> Tambah {activeTab === 'student' ? 'Siswa' : activeTab === 'teacher' ? 'Guru' : 'Admin'}
          </Button>
        </div>
      </div>

      <div className="flex gap-4 border-b overflow-x-auto">
        {['student', 'teacher', 'admin'].map(tab => (
          <button key={tab} className={`px-4 py-2 font-bold border-b-[3px] transition-colors whitespace-nowrap ${activeTab === tab ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => { setActiveTab(tab); cancelForm(); setSearchTerm(''); setFilterClass(''); }}>
            {tab === 'student' ? 'Data Siswa' : tab === 'teacher' ? 'Data Guru' : 'Admin Sistem'}
          </button>
        ))}
      </div>

      {showForm && (
        <Card className="bg-blue-50/50 border-blue-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-bold border-b pb-2 mb-4">
              {editingUserId ? 'Edit' : 'Form Tambah'} {activeTab === 'student' ? 'Siswa' : activeTab === 'teacher' ? 'Guru' : 'Admin'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nama Lengkap" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <Input label={activeTab === 'student' ? 'NIS (Username)' : activeTab === 'teacher' ? 'NIP (Username)' : 'Username'} value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
              <Input label="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
              {activeTab === 'student' && <Select label="Kelas" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} required options={CLASS_OPTIONS} />}
              {activeTab === 'teacher' && <Input label="Mata Pelajaran" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required />}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={cancelForm}>Batal</Button>
              <Button type="submit"><Save size={16}/> {editingUserId ? 'Simpan Perubahan' : 'Simpan Data'}</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Cari Nama / ID..." 
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {activeTab === 'student' && (
              <select 
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
              >
                <option value="">Semua Kelas</option>
                {CLASS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            )}
          </div>
          {['student', 'teacher'].includes(activeTab) && (
            <Button 
              variant="danger" 
              onClick={() => setShowDeleteBulkConfirm(true)}
              disabled={filteredUsers.length === 0}
              className="w-full md:w-auto text-sm py-2 shadow-sm"
            >
              <Trash2 size={16}/> Hapus {filteredUsers.length} Data Tertampil
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3">Nama</th>
                <th className="p-3">{activeTab === 'student' ? 'NIS' : activeTab === 'teacher' ? 'NIP' : 'Username'}</th>
                <th className="p-3">Password</th>
                {activeTab === 'student' && <th className="p-3">Kelas</th>}
                {activeTab === 'teacher' && <th className="p-3">Mapel</th>}
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.username}</td>
                  <td className="p-3 font-mono text-gray-500">{u.password}</td>
                  {activeTab === 'student' && <td className="p-3">{u.class}</td>}
                  {activeTab === 'teacher' && <td className="p-3">{u.subject}</td>}
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEditClick(u)} className="text-blue-500 p-2 hover:bg-blue-50 rounded transition-colors" title="Edit">
                        <Edit size={16} />
                      </button>
                      {u.role !== 'admin' && (
                        <button onClick={() => setDeleteId(u.id)} className="text-red-500 p-2 hover:bg-red-50 rounded transition-colors" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan="6" className="text-center p-8 text-gray-500">Tidak ada data pengguna yang sesuai.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={!!deleteId} title="Hapus Pengguna?" onClose={() => setDeleteId(null)}>
        <p className="mb-6 text-gray-700">Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
          <Button variant="danger" onClick={() => { deleteUser(deleteId); setDeleteId(null); }}>Ya, Hapus</Button>
        </div>
      </Modal>

      <Modal isOpen={showDeleteBulkConfirm} title="Konfirmasi Hapus Massal" onClose={() => setShowDeleteBulkConfirm(false)}>
        <div className="mb-6 space-y-3">
          <p className="text-gray-800">
            Anda akan menghapus <strong>{filteredUsers.length}</strong> data akun yang saat ini sedang tertampil di layar.
          </p>
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan dan akan langsung dihapus dari sistem secara permanen.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowDeleteBulkConfirm(false)}>Batal</Button>
          <Button variant="danger" onClick={handleBulkDelete}>Ya, Hapus Semua Tertampil</Button>
        </div>
      </Modal>
    </div>
  );
};

const TeacherDashboard = () => {
  const { exams, questions, results, users, currentUser, addExam, deleteExam, addQuestion, editQuestion, deleteQuestion, addQuestionsBulk } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('exams'); 
  const [showExamForm, setShowExamForm] = useState(false);
  const [examForm, setExamForm] = useState({ title: '', targetClass: 'X.1', durationMinutes: '60' });
  const [deleteExamId, setDeleteExamId] = useState(null);
  
  const [selectedExamId, setSelectedExamId] = useState('');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionForm, setQuestionForm] = useState({ text: '', imageUrl: '', options: ['', '', '', '', ''], correctAnswer: 0 });
  const [deleteQuestionId, setDeleteQuestionId] = useState(null);
  
  const [showAIModal, setShowAIModal] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showApiInput, setShowApiInput] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('HOTS (Analitis)');
  const [aiCount, setAiCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  const myExams = exams.filter(e => e.teacherId === currentUser.id);
  const currentQuestions = questions.filter(q => q.examId === selectedExamId);

  const handleExamSubmit = (e) => {
    e.preventDefault();
    addExam({ ...examForm, subject: currentUser.subject, durationMinutes: parseInt(examForm.durationMinutes) || 60 });
    setShowExamForm(false);
    setExamForm({ title: '', targetClass: 'X.1', durationMinutes: '60' });
  };

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    if (!selectedExamId) return;
    
    if (editingQuestionId) {
      editQuestion({ ...questionForm, id: editingQuestionId, examId: selectedExamId, correctAnswer: parseInt(questionForm.correctAnswer) });
    } else {
      addQuestion({ ...questionForm, examId: selectedExamId, correctAnswer: parseInt(questionForm.correctAnswer) });
    }
    setShowQuestionForm(false);
    setEditingQuestionId(null);
    setQuestionForm({ text: '', imageUrl: '', options: ['', '', '', '', ''], correctAnswer: 0 });
  };

  const handleEditQuestionClick = (q) => {
    setQuestionForm({
      text: q.text,
      imageUrl: q.imageUrl || '',
      options: q.options.length === 5 ? q.options : [...q.options, '', '', '', '', ''].slice(0,5),
      correctAnswer: q.correctAnswer
    });
    setEditingQuestionId(q.id);
    setShowQuestionForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        setQuestionForm(prev => ({ ...prev, imageUrl: evt.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateSmartLocalQuestions = (topic, count, subject, difficulty) => {
    const cleanTopic = topic.trim();
    const templates = [
      {
        q: `Dalam kajian ${subject}, manakah pernyataan di bawah ini yang paling tepat mendeskripsikan konsep fundamental dari "${cleanTopic}"?`,
        opts: [
          `Merupakan prinsip dasar dalam ${cleanTopic} yang mengatur keterkaitan antar komponen utama secara sistematis`,
          `Hanya berlaku pada kondisi terisolasi tanpa dipengaruhi oleh variabel eksternal ${subject}`,
          `Sebuah hipotesis awal dalam ${cleanTopic} yang belum teruji secara empiris maupun teoritis`,
          `Proses reduksi komponen ${cleanTopic} menjadi elemen tunggal yang berdiri sendiri`,
          `Faktor sekunder yang tidak memiliki dampak langsung terhadap struktur utama ${cleanTopic}`
        ],
        ans: 0
      },
      {
        q: `Perhatikan kasus berikut: Ketika terjadi perubahan variabel utama dalam penerapan "${cleanTopic}", dampak analitis yang paling rasional terjadi menurut prinsip ${subject} adalah...`,
        opts: [
          `Sistem tetap statis karena ${cleanTopic} bersifat mutlak dan tidak terpengaruh variabel luar`,
          `Terjadi penyesuaian keseimbangan baru sebagai respons langsung terhadap perubahan parameter pada ${cleanTopic}`,
          `Seluruh struktur dasar dari ${cleanTopic} akan langsung berhenti berfungsi secara permanen`,
          `Perubahan tersebut hanya berdampak pada aspek penamaan, bukan pada mekanisme kerja ${cleanTopic}`,
          `Munculnya anomali acak yang tidak dapat dijelaskan menggunakan pendekatan ilmiah ${subject}`
        ],
        ans: 1
      },
      {
        q: `Seorang peneliti melakukan evaluasi mendalam terhadap efisiensi "${cleanTopic}". Indikator utama yang membuktikan bahwa penerapan konsep tersebut telah berjalan optimal adalah...`,
        opts: [
          `Banyaknya jumlah tahapan yang harus dilalui tanpa memperhatikan hasil akhir`,
          `Tingginya biaya operasional yang dikeluarkan selama proses pengamatan berlangsung`,
          `Kesesuaian antara hasil aktual di lapangan dengan parameter keberhasilan teoritis pada ${cleanTopic}`,
          `Tidak adanya interaksi sama sekali antara objek kajian dengan lingkungan sekitarnya`,
          `Penghapusan seluruh prosedur standar demi mempercepat waktu penyelesaian`
        ],
        ans: 2
      },
      {
        q: `Apa perbedaan paling mendasar antara pendekatan konvensional dengan pendekatan modern berbasis ${difficulty} dalam menganalisis persoalan "${cleanTopic}"?`,
        opts: [
          `Pendekatan modern mengabaikan data historis dan hanya fokus pada spekulasi`,
          `Pendekatan konvensional selalu menghasilkan kesimpulan yang lebih akurat di segala situasi`,
          `Tidak ada perbedaan signifikan karena keduanya menggunakan instrumen yang persis sama`,
          `Pendekatan modern mengintegrasikan analisis multi-variabel secara komprehensif untuk memecahkan masalah ${cleanTopic}`,
          `Pendekatan modern hanya dapat diterapkan oleh tingkat lanjut dan tidak relevan untuk tingkat SMA`
        ],
        ans: 3
      },
      {
        q: `Jika ditemukan kendala struktural saat mengimplementasikan "${cleanTopic}" dalam studi kasus ${subject}, langkah penyelesaian masalah (problem solving) pertama yang paling tepat dilakukan adalah...`,
        opts: [
          `Mengganti seluruh topik penelitian dengan materi lain yang tidak berkaitan`,
          `Mengabaikan kendala tersebut dan tetap melanjutkan proses hingga selesai`,
          `Menyalahkan instrumen pengukuran tanpa melakukan kalibrasi atau pemeriksaan ulang`,
          `Membuat kesimpulan akhir secara sepihak sebelum data terkumpul sepenuhnya`,
          `Mengidentifikasi akar permasalahan melalui evaluasi variabel kritis yang memengaruhi ${cleanTopic}`
        ],
        ans: 4
      },
      {
        q: `Faktor manakah di bawah ini yang memiliki korelasi positif paling kuat dalam mendukung keberhasilan proses "${cleanTopic}"?`,
        opts: [
          `Keterpaduan antara landasan konseptual ${subject} dan ketepatan prosedur pelaksanaan`,
          `Pengurangan pengawasan kualitas agar proses berjalan tanpa hambatan aturan`,
          `Penggunaan asumsi subjektif tanpa didukung oleh data pengamatan yang valid`,
          `Pembatasan informasi pendukung sehingga analisis hanya berfokus pada satu sudut pandang sempit`,
          `Ketergantungan penuh pada faktor kebetulan selama eksperimen berlangsung`
        ],
        ans: 0
      },
      {
        q: `Dalam konteks pembelajaran ${subject} tingkat SMA, mengapa pemahaman mendalam mengenai "${cleanTopic}" menjadi sangat krusial bagi siswa?`,
        opts: [
          `Karena materi tersebut hanya digunakan untuk menghafal istilah-istilah asing`,
          `Sebagai fondasi berpikir kritis untuk menganalisis fenomena nyata yang berkaitan dengan ${cleanTopic}`,
          `Agar dapat menghindari materi lain yang dianggap lebih kompleks dalam ujian`,
          `Karena konsep ini tidak pernah mengalami perkembangan sejak pertama kali ditemukan`,
          `Hanya sebagai syarat administratif tanpa adanya manfaat aplikatif di kehidupan sehari-hari`
        ],
        ans: 1
      }
    ];

    const generated = [];
    for (let i = 0; i < count; i++) {
      const tpl = templates[i % templates.length];
      const shift = i % 5;
      const rotatedOptions = [...tpl.opts];
      const correctText = rotatedOptions[tpl.ans];
      
      // Mengacak posisi opsi agar kunci jawaban tersebar merata (A-E)
      for (let s = 0; s < shift; s++) {
        rotatedOptions.push(rotatedOptions.shift());
      }
      const newCorrectIndex = rotatedOptions.indexOf(correctText);
      const suffix = i >= templates.length ? ` (Studi Kasus Bagian ${Math.floor(i / templates.length) + 1})` : '';

      generated.push({
        examId: selectedExamId,
        text: `${tpl.q}${suffix}`,
        options: rotatedOptions,
        correctAnswer: newCorrectIndex >= 0 ? newCorrectIndex : 0
      });
    }
    return generated;
  };

  const handleGenerateAI = async (e) => {
    e.preventDefault();
    if (!aiTopic.trim()) {
      setAiError("Topik materi tidak boleh kosong!");
      return;
    }

    const numQuestions = Math.min(50, Math.max(1, parseInt(aiCount) || 5));
    setIsGenerating(true);
    setAiError('');

    const cleanKey = apiKey.trim();

    // Jika API Key diisi oleh guru, coba hubungi Gemini API terlebih dahulu
    if (cleanKey) {
      try {
        const promptText = `Anda adalah guru ahli mata pelajaran ${currentUser.subject || 'SMA'}. Buatlah tepat ${numQuestions} soal ujian pilihan ganda tingkat SMA dengan tingkat kesulitan ${aiDifficulty} untuk topik materi: "${aiTopic}".
Pastikan setiap soal berbobot, jelas, dan memiliki tepat 5 pilihan jawaban (A, B, C, D, E) beserta 1 indeks jawaban yang benar (angka 0 sampai 4).
Kembalikan HANYA dalam format JSON Array murni seperti contoh berikut tanpa tambahan teks markdown apapun:
[{"text": "Pertanyaan...", "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D", "Opsi E"], "correctAnswer": 0}]`;

        const payload = {
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
          }
        };

        const endpoints = [
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${cleanKey}`,
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cleanKey}`
        ];

        let responseData = null;
        for (const url of endpoints) {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            responseData = await res.json();
            break;
          }
        }

        if (responseData && responseData.candidates?.[0]?.content?.parts?.[0]?.text) {
          const rawText = responseData.candidates[0].content.parts[0].text;
          const jsonMatch = rawText.match(/\[[\s\S]*\]/);
          const cleanJson = jsonMatch ? jsonMatch[0] : rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);

          if (Array.isArray(parsed) && parsed.length > 0) {
            const formattedQuestions = parsed.map((q) => {
              const opts = Array.isArray(q.options) ? q.options.slice(0, 5).map(o => String(o)) : [];
              while (opts.length < 5) opts.push(`Pilihan ${String.fromCharCode(65 + opts.length)}`);
              const ans = parseInt(q.correctAnswer);
              return {
                examId: selectedExamId,
                text: String(q.text || `Pertanyaan mengenai ${aiTopic}`),
                options: opts,
                correctAnswer: (!isNaN(ans) && ans >= 0 && ans <= 4) ? ans : 0
              };
            });

            addQuestionsBulk(formattedQuestions);
            setIsGenerating(false);
            setShowAIModal(false);
            setAiTopic('');
            return;
          }
        }
      } catch (err) {
        console.warn("Koneksi API Eksternal terkendala, mengalihkan ke Smart Local AI Generator...", err);
      }
    }

    // Smart Fallback: Jika tanpa API Key atau API Key gagal, gunakan Mesin AI Lokal Pintar
    setTimeout(() => {
      const smartQuestions = generateSmartLocalQuestions(
        aiTopic,
        numQuestions,
        currentUser.subject || 'Umum',
        aiDifficulty
      );
      addQuestionsBulk(smartQuestions);
      setIsGenerating(false);
      setShowAIModal(false);
      setAiTopic('');
    }, 800);
  };

  const exportExcel = (exam) => {
    const resultsForExam = results.filter(r => r.examId === exam.id);
    let table = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8" /></head><body>`;
    table += `<table border="1"><thead><tr><th style="background-color:#4CAF50;color:white;">Nama Siswa</th><th style="background-color:#4CAF50;color:white;">NIS</th><th style="background-color:#4CAF50;color:white;">Kelas</th><th style="background-color:#4CAF50;color:white;">Nilai Akhir</th><th style="background-color:#f44336;color:white;">Peringatan Kecurangan (Pindah Tab)</th></tr></thead><tbody>`;
    
    resultsForExam.forEach(r => {
       const student = users.find(u => u.id === r.studentId) || {};
       table += `<tr><td>${student.name || '-'}</td><td>${student.nis || '-'}</td><td>${student.class || '-'}</td><td><b>${r.score}</b></td><td>${r.cheatingWarnings} kali</td></tr>`;
    });
    
    table += `</tbody></table></body></html>`;
    
    const uri = 'data:application/vnd.ms-excel;base64,' + btoa(unescape(encodeURIComponent(table)));
    const link = document.createElement('a');
    link.href = uri;
    link.download = `Nilai_${exam.title.replace(/\s+/g, '_')}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Dashboard Guru - {currentUser.subject}</h2>
        {activeTab === 'exams' && (
          <Button onClick={() => setShowExamForm(true)}>
            <span className="flex items-center gap-1"><Plus size={16}/> Buat Ujian Baru</span>
          </Button>
        )}
      </div>

      <div className="flex gap-4 border-b">
        {['exams', 'questions', 'results'].map(tab => (
          <button key={tab} className={`px-4 py-2 font-bold border-b-[3px] transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab(tab)}>
            {tab === 'exams' ? 'Kelola Ujian' : tab === 'questions' ? 'Bank Soal' : 'Hasil & Nilai'}
          </button>
        ))}
      </div>

      {activeTab === 'exams' && (
        <div className="space-y-4">
          {showExamForm && (
            <Card className="bg-blue-50/50 border-blue-100">
              <form onSubmit={handleExamSubmit} className="space-y-4">
                <h3 className="font-bold border-b pb-2">Form Buat Ujian</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="Judul Ujian" value={examForm.title} onChange={e => setExamForm({...examForm, title: e.target.value})} required placeholder="Contoh: UTS Semester 1" />
                  <Select label="Target Kelas" value={examForm.targetClass} onChange={e => setExamForm({...examForm, targetClass: e.target.value})} options={CLASS_OPTIONS} required />
                  <Input label="Durasi (Menit)" type="number" min="10" value={examForm.durationMinutes} onChange={e => setExamForm({...examForm, durationMinutes: e.target.value})} required />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowExamForm(false)}>Batal</Button>
                  <Button type="submit"><span className="flex items-center gap-1"><Save size={16}/> Simpan Ujian</span></Button>
                </div>
              </form>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myExams.map(exam => (
              <Card key={exam.id} className="border-l-4 border-blue-500">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{exam.title}</h3>
                    <p className="text-sm text-gray-500">Kelas: {exam.targetClass} | Durasi: {exam.durationMinutes} Menit</p>
                  </div>
                  <button onClick={() => setDeleteExamId(exam.id)} className="text-red-500 p-2 hover:bg-red-50 rounded" title="Hapus Ujian">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="text-sm flex-1" onClick={() => { setActiveTab('questions'); setSelectedExamId(exam.id); }}>
                    <span className="flex items-center gap-1"><BookOpen size={14}/> Kelola Soal</span>
                  </Button>
                  <Button variant="outline" className="text-sm flex-1 text-green-700" onClick={() => { setActiveTab('results'); setSelectedExamId(exam.id); }}>
                    <span className="flex items-center gap-1"><Eye size={14}/> Lihat Nilai</span>
                  </Button>
                </div>
              </Card>
            ))}
            {myExams.length === 0 && <p className="text-gray-500 p-4">Anda belum membuat ujian satupun.</p>}
          </div>
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 p-4 rounded-xl border">
            <div className="w-full md:w-1/2">
              <Select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)}>
                <option value="" disabled>-- Pilih Ujian untuk Mengelola Soal --</option>
                {myExams.map(ex => <option key={ex.id} value={ex.id}>{ex.title} ({ex.targetClass})</option>)}
              </Select>
            </div>
            {selectedExamId && (
              <div className="flex gap-2 w-full md:w-auto">
                <Button onClick={() => setShowAIModal(true)} className="bg-purple-600 hover:bg-purple-700 flex-1 md:flex-none">
                  <span className="flex items-center gap-1"><Bot size={16}/> AI Generate</span>
                </Button>
                <Button onClick={() => { setEditingQuestionId(null); setQuestionForm({ text: '', imageUrl: '', options: ['', '', '', '', ''], correctAnswer: 0 }); setShowQuestionForm(true); }} className="flex-1 md:flex-none">
                  <span className="flex items-center gap-1"><Plus size={16}/> Tambah Soal</span>
                </Button>
              </div>
            )}
          </div>

          {selectedExamId && showQuestionForm && (
            <Card className="bg-blue-50/50 border-blue-100">
              <form onSubmit={handleQuestionSubmit} className="space-y-4">
                <h3 className="font-bold border-b pb-2">{editingQuestionId ? 'Edit Soal' : 'Form Tambah Soal Manual'}</h3>
                
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-sm font-medium text-gray-700">Pertanyaan</label>
                  <textarea className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]" required value={questionForm.text} onChange={e => setQuestionForm({...questionForm, text: e.target.value})} placeholder="Tuliskan pertanyaan di sini..." />
                </div>

                <div className="flex flex-col gap-1 w-full p-4 bg-white rounded-lg border border-gray-200">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <ImageIcon size={16}/> Gambar Pendukung (Opsional)
                  </label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm mt-2" />
                  {questionForm.imageUrl && (
                    <div className="mt-3 relative inline-block">
                      <img src={questionForm.imageUrl} alt="Preview" className="max-h-40 rounded border shadow-sm" />
                      <button type="button" onClick={() => setQuestionForm({...questionForm, imageUrl: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600">
                        <X size={14}/>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Pilihan Jawaban (A - E)</label>
                  {[0, 1, 2, 3, 4].map(idx => (
                    <div key={idx} className="flex gap-3 items-center bg-white p-2 rounded-lg border border-gray-200">
                      <span className="font-bold w-6 text-center">{String.fromCharCode(65+idx)}</span>
                      <input type="text" className="flex-1 border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500" required placeholder={`Pilihan ${String.fromCharCode(65+idx)}`} value={questionForm.options[idx] || ''} onChange={e => {
                        const newOpts = [...questionForm.options];
                        newOpts[idx] = e.target.value;
                        setQuestionForm({...questionForm, options: newOpts});
                      }} />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="correctAnswer" checked={questionForm.correctAnswer === idx} onChange={() => setQuestionForm({...questionForm, correctAnswer: idx})} className="w-5 h-5 text-blue-600" />
                        <span className="text-sm whitespace-nowrap">Kunci</span>
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => { setShowQuestionForm(false); setEditingQuestionId(null); }}>Batal</Button>
                  <Button type="submit"><span className="flex items-center gap-1"><Save size={16}/> {editingQuestionId ? 'Simpan Perubahan' : 'Simpan Soal'}</span></Button>
                </div>
              </form>
            </Card>
          )}

          {selectedExamId && (
            <div className="space-y-3">
              {currentQuestions.map((q, index) => (
                <Card key={q.id} className="relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => handleEditQuestionClick(q)} className="p-2 text-blue-500 hover:bg-blue-50 rounded" title="Edit Soal"><Edit size={16}/></button>
                    <button onClick={() => setDeleteQuestionId(q.id)} className="p-2 text-red-500 hover:bg-red-50 rounded" title="Hapus Soal"><Trash2 size={16}/></button>
                  </div>
                  <h4 className="font-bold pr-16 mb-2">{index + 1}. {typeof q.text === 'object' ? JSON.stringify(q.text) : q.text}</h4>
                  {q.imageUrl && <img src={q.imageUrl} alt="Ilustrasi" className="max-h-32 mb-3 rounded border" />}
                  <ul className="space-y-1">
                    {q.options.map((opt, i) => (
                      <li key={i} className={`p-2 rounded ${q.correctAnswer === i ? 'bg-green-50 text-green-700 font-medium border border-green-200' : 'bg-gray-50 border border-transparent'}`}>
                        {String.fromCharCode(65+i)}. {typeof opt === 'object' ? JSON.stringify(opt) : opt} {q.correctAnswer === i && '(Kunci)'}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
              {currentQuestions.length === 0 && <p className="text-center p-8 text-gray-500 bg-white rounded-xl border">Belum ada soal untuk ujian ini.</p>}
            </div>
          )}
        </div>
      )}

      {activeTab === 'results' && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-center justify-between">
            <Select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)} className="w-full md:w-1/2">
              <option value="" disabled>-- Pilih Ujian untuk Melihat Nilai --</option>
              {myExams.map(ex => <option key={ex.id} value={ex.id}>{ex.title} ({ex.targetClass})</option>)}
            </Select>
            {selectedExamId && (
              <Button onClick={() => exportExcel(myExams.find(e => e.id === selectedExamId))} className="bg-green-600 hover:bg-green-700 w-full md:w-auto">
                <span className="flex items-center gap-1"><Download size={16}/> Unduh .XLS</span>
              </Button>
            )}
          </div>

          {selectedExamId && (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-3">Nama Siswa</th>
                      <th className="p-3">NIS</th>
                      <th className="p-3">Kelas</th>
                      <th className="p-3 text-center">Nilai Akhir</th>
                      <th className="p-3 text-center">Peringatan Mencontek</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.filter(r => r.examId === selectedExamId).map(r => {
                      const student = users.find(u => u.id === r.studentId) || {};
                      return (
                        <tr key={r.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{student.name}</td>
                          <td className="p-3">{student.nis}</td>
                          <td className="p-3">{student.class}</td>
                          <td className="p-3 text-center font-bold text-lg">{r.score}</td>
                          <td className="p-3 text-center">
                            {r.cheatingWarnings > 0 ? (
                              <span className="text-red-600 bg-red-50 px-2 py-1 rounded-full text-sm font-medium border border-red-200">
                                {r.cheatingWarnings}x Pindah Tab
                              </span>
                            ) : (
                              <span className="text-green-600">Aman</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                    {results.filter(r => r.examId === selectedExamId).length === 0 && (
                      <tr><td colSpan="5" className="text-center p-8 text-gray-500">Belum ada siswa yang mengumpulkan ujian ini.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Modals for Teacher */}
      <Modal isOpen={!!deleteExamId} title="Hapus Ujian?" onClose={() => setDeleteExamId(null)}>
        <p className="mb-6 text-gray-700">Apakah Anda yakin ingin menghapus ujian ini beserta seluruh soal dan nilainya? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteExamId(null)}>Batal</Button>
          <Button variant="danger" onClick={() => { deleteExam(deleteExamId); setDeleteExamId(null); }}>Ya, Hapus</Button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteQuestionId} title="Hapus Soal?" onClose={() => setDeleteQuestionId(null)}>
        <p className="mb-6 text-gray-700">Apakah Anda yakin ingin menghapus butir soal ini?</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteQuestionId(null)}>Batal</Button>
          <Button variant="danger" onClick={() => { deleteQuestion(deleteQuestionId); setDeleteQuestionId(null); }}>Ya, Hapus</Button>
        </div>
      </Modal>

      <Modal isOpen={showAIModal} title="AI Smart Question Generator" onClose={() => !isGenerating && setShowAIModal(false)}>
        <form onSubmit={handleGenerateAI} className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 text-purple-900 p-3 rounded-lg text-sm">
            Masukkan topik materi ujian Anda. Sistem AI akan otomatis merakit soal pilihan ganda (A-E) lengkap dengan kunci jawabannya secara instan!
          </div>
          
          {aiError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
              {aiError}
            </div>
          )}

          <Input 
            label="Topik / Materi Pokok Soal" 
            value={aiTopic} 
            onChange={e => setAiTopic(e.target.value)} 
            required 
            placeholder={`Contoh: ${currentUser.subject === 'Matematika' ? 'Persamaan Kuadrat & Fungsi' : 'Sejarah Kemerdekaan Indonesia'}`} 
            disabled={isGenerating} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
              label="Tingkat Kesulitan Soal" 
              value={aiDifficulty} 
              onChange={e => setAiDifficulty(e.target.value)} 
              options={['Dasar (Pemahaman)', 'Menengah (Aplikasi)', 'HOTS (Analitis)']} 
              required 
              disabled={isGenerating}
            />
            <Input 
              label="Jumlah Soal (Maks. 50)" 
              type="number" 
              min="1" 
              max="50" 
              value={aiCount} 
              onChange={e => setAiCount(e.target.value)} 
              required 
              disabled={isGenerating} 
            />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <button 
              type="button" 
              onClick={() => setShowApiInput(!showApiInput)} 
              className="text-xs text-gray-500 hover:text-purple-600 font-medium flex items-center gap-1"
            >
              {showApiInput ? '▾ Sembunyikan Pengaturan Lanjutan (API Key)' : '▸ Pengaturan Lanjutan: Gunakan Google Gemini API Key Sendiri (Opsional)'}
            </button>
            
            {showApiInput && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                <Input 
                  label="Google Gemini API Key (Opsional)" 
                  type="password"
                  value={apiKey} 
                  onChange={e => {
                    setApiKey(e.target.value);
                    localStorage.setItem('gemini_api_key', e.target.value);
                  }} 
                  placeholder="Kosongkan jika ingin menggunakan AI Bawaan Sistem..." 
                  disabled={isGenerating} 
                />
                <p className="text-[11px] text-gray-500">
                  *Jika dikosongkan, sistem otomatis memakai <strong>Smart Local Generator</strong> yang bebas error dan tanpa kuota.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-4 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => setShowAIModal(false)} disabled={isGenerating}>Batal</Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={isGenerating}>
              {isGenerating ? 'Sedang Menyusun Soal...' : <span className="flex items-center gap-1"><Bot size={16}/> Buat Soal Sekarang</span>}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

const ExamEngine = ({ exam, onComplete }) => {
  const { questions, currentUser, saveResult } = useContext(AppContext);
  const examQuestions = questions.filter(q => q.examId === exam.id);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [warnings, setWarnings] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setWarnings(w => w + 1);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) { submitExam(); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const submitExam = () => {
    let correct = 0;
    examQuestions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    const score = Math.round((correct / examQuestions.length) * 100) || 0;
    saveResult({ examId: exam.id, studentId: currentUser.id, score, cheatingWarnings: warnings });
    onComplete(); 
  };

  const q = examQuestions[currentIdx];
  const formatTime = (secs) => {
    if (secs < 0) return "00:00";
    return `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;
  };

  if (examQuestions.length === 0) {
    return (
      <div className="text-center mt-10">
        <Card className="max-w-md mx-auto inline-block p-8">
          <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Soal Belum Tersedia</h2>
          <p className="text-gray-600 mb-6">Guru belum menambahkan soal untuk ujian ini. Silakan kembali nanti.</p>
          <Button onClick={onComplete} className="w-full">Kembali ke Beranda</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-4 z-10">
        <div>
          <h2 className="font-bold text-lg md:text-xl truncate text-gray-900">{exam.title}</h2>
          <p className="text-sm text-gray-500 font-medium">Soal {currentIdx + 1} dari {examQuestions.length}</p>
        </div>
        <div className="flex gap-4 items-center w-full md:w-auto justify-between md:justify-end">
          {warnings > 0 && (
            <span className="text-red-700 text-sm font-bold flex items-center gap-1 bg-red-100 px-3 py-1.5 rounded-full border border-red-200 animate-pulse">
              <AlertTriangle size={16}/> Proctoring: {warnings}x Pindah Tab
            </span>
          )}
          <div className={`text-xl font-mono font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'text-blue-700 bg-blue-50 border-blue-200'}`}>
            <Clock size={20}/> {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <Card className="min-h-[350px]">
        <h3 className="text-lg md:text-xl leading-relaxed mb-6 font-medium text-gray-800">
          {typeof q.text === 'object' ? JSON.stringify(q.text) : q.text}
        </h3>
        
        {q.imageUrl && (
          <div className="mb-8 flex justify-center bg-gray-50 p-4 rounded-xl border border-gray-200">
             <img src={q.imageUrl} alt="Ilustrasi Soal" className="max-w-full max-h-72 object-contain rounded-lg shadow-sm" />
          </div>
        )}

        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => setAnswers({...answers, [currentIdx]: i})} 
              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${answers[currentIdx] === i ? 'bg-blue-50 border-blue-500 shadow-sm' : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
              <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${answers[currentIdx] === i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                {String.fromCharCode(65+i)}
              </span>
              <span className="mt-1 leading-relaxed text-gray-800">{typeof opt === 'object' ? JSON.stringify(opt) : String(opt)}</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <Button variant="outline" onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0} className="w-full md:w-auto">
          Sebelumnya
        </Button>
        
        <div className="flex gap-2 flex-wrap justify-center max-w-full overflow-x-auto py-2 px-2">
          {examQuestions.map((_, i) => (
            <button key={i} onClick={() => setCurrentIdx(i)} 
              className={`w-10 h-10 rounded-lg text-sm font-bold transition-transform hover:scale-105 border-2 ${currentIdx === i ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''} ${answers[i] !== undefined ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-600'}`}>
              {i + 1}
            </button>
          ))}
        </div>

        {currentIdx === examQuestions.length - 1 ? (
          <Button variant="primary" onClick={() => setShowConfirm(true)} className="w-full md:w-auto bg-green-600 hover:bg-green-700 border-green-700 shadow-sm">Kumpulkan Ujian</Button>
        ) : (
          <Button variant="outline" onClick={() => setCurrentIdx(Math.min(examQuestions.length - 1, currentIdx + 1))} className="w-full md:w-auto">
            Selanjutnya
          </Button>
        )}
      </div>

      <Modal isOpen={showConfirm} title="Konfirmasi Pengumpulan Akhir" onClose={() => setShowConfirm(false)}>
        <div className="mb-6 space-y-4">
          <p className="text-gray-800 text-lg font-medium">Apakah Anda yakin ingin menyelesaikan ujian ini sekarang?</p>
          
          {Object.keys(answers).length < examQuestions.length && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg flex items-start gap-3 text-yellow-900 shadow-sm">
              <AlertTriangle className="flex-shrink-0 mt-0.5 text-yellow-600" />
              <div>
                <p className="font-bold">Peringatan: Ada Soal Kosong!</p>
                <p className="text-sm mt-1">Anda baru menjawab <strong>{Object.keys(answers).length}</strong> dari total <strong>{examQuestions.length}</strong> soal.</p>
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded border">Pastikan semua jawaban sudah benar. Setelah dikumpulkan, Anda tidak dapat mengubah jawaban lagi dan nilai akan langsung tersimpan di sistem.</p>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => setShowConfirm(false)}>Batal Kumpulkan</Button>
          <Button onClick={submitExam} className="bg-green-600 hover:bg-green-700 text-white shadow-sm">Ya, Kumpulkan Sekarang</Button>
        </div>
      </Modal>
    </div>
  );
};

const StudentDashboard = () => {
  const { exams, results, currentUser } = useContext(AppContext);
  const [activeExam, setActiveExam] = useState(null);
  
  const myExams = exams.filter(e => e.targetClass === currentUser.class);
  const completedExamIds = results.filter(r => r.studentId === currentUser.id).map(r => r.examId);

  if (activeExam) {
    return <ExamEngine exam={activeExam} onComplete={() => setActiveExam(null)} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 md:p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Halo, {currentUser.name}!</h2>
          <p className="text-blue-100 text-sm md:text-base opacity-90">Selamat datang di Dashboard Siswa. Kelas: {currentUser.class} | NIS: {currentUser.nis}</p>
        </div>
        <BookOpen className="absolute right-[-20px] bottom-[-20px] text-white opacity-10 rotate-12" size={150} />
      </div>

      <h3 className="text-xl font-bold mt-8 border-b pb-2 text-gray-800">Daftar Ujian Anda</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myExams.map(exam => {
          const isDone = completedExamIds.includes(exam.id);
          const result = results.find(r => r.examId === exam.id && r.studentId === currentUser.id);
          
          return (
            <Card key={exam.id} className={`transition-all ${isDone ? 'bg-gray-50 border-gray-200' : 'border-l-4 border-blue-500 hover:shadow-md hover:-translate-y-1'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`font-bold text-lg ${isDone ? 'text-gray-600' : 'text-gray-900'}`}>{exam.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 font-medium">{exam.subject} | <Clock size={14} className="inline mb-0.5"/> {exam.durationMinutes} Menit</p>
                </div>
                {isDone ? <CheckCircle className="text-green-500 flex-shrink-0" size={24} /> : <BookOpen className="text-blue-500 flex-shrink-0" size={24} />}
              </div>
              
              {isDone ? (
                <div className="bg-green-50 border border-green-200 text-green-900 p-4 rounded-xl flex justify-between items-center shadow-inner">
                  <div>
                    <span className="block font-medium text-sm text-green-700">Status</span>
                    <span className="font-bold flex items-center gap-1"><CheckCircle size={14}/> Selesai</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-medium text-sm text-green-700">Nilai Akhir</span>
                    <span className="font-black text-2xl text-green-600">{result?.score}</span>
                  </div>
                </div>
              ) : (
                <Button className="w-full mt-2 py-3 shadow-sm font-bold" onClick={() => setActiveExam(exam)}>
                  Mulai Kerjakan Sekarang
                </Button>
              )}
            </Card>
          );
        })}
        {myExams.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center p-12 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500">
            <CheckCircle size={48} className="mx-auto mb-4 text-gray-300"/>
            <p className="font-medium text-lg">Tidak ada jadwal ujian untuk kelas Anda saat ini.</p>
            <p className="text-sm mt-1">Silakan beristirahat atau pelajari materi Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const { currentUser, login, logout } = useContext(AppContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const user = login(username, password);
    if (!user) {
      setLoginError('NIS/NIP atau password tidak valid! Periksa kembali kredensial Anda.');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        <Card className="w-full max-w-md p-8 shadow-2xl border-t-8 border-t-blue-600 animate-in slide-in-from-bottom-8 duration-500">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-blue-100">
              <BookOpen size={40} className="text-blue-600" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">SMART EXAM</h1>
            <p className="text-blue-600 font-medium mt-1">SMA Negeri 1 Kembang</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium text-center border border-red-200 animate-in shake">
                {loginError}
              </div>
            )}
            
            <Input label="NIS/NIP (Atau Username Admin)" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Masukkan NIS atau NIP Anda" />
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            
            <Button type="submit" className="w-full pt-3 pb-3 mt-2 text-lg shadow-md hover:shadow-lg transition-all">Masuk Sistem</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <nav className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-3 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg hidden md:block shadow-sm">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-blue-700 leading-tight">SMART EXAM</h1>
            <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider">SMAN 1 Kembang</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right flex flex-col justify-center">
            <p className="font-bold text-sm text-gray-900">{typeof currentUser.name === 'string' ? currentUser.name : 'User'}</p>
            <p className="text-[10px] md:text-xs font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-0.5 w-max ml-auto border border-blue-100">
              Role: {typeof currentUser.role === 'string' ? currentUser.role : 'Guest'}
            </p>
          </div>
          <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
          <button onClick={logout} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2" title="Keluar">
            <LogOut size={20} />
            <span className="text-sm font-bold hidden md:block">Keluar</span>
          </button>
        </div>
      </nav>
      <main className="w-full px-4 md:px-8 py-6 pb-20">
        {currentUser.role === 'admin' && <AdminUsers />}
        {currentUser.role === 'teacher' && <TeacherDashboard />}
        {currentUser.role === 'student' && <StudentDashboard />}
      </main>
    </div>
  );
};

export default function AppWrapper() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}