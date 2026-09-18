import React, { useState } from 'react';
import { Users, UserPlus, Trash2, Edit2, Check, X, Search, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Siswa({ 
  studentList, 
  activeStudents, 
  isAdmin, 
  onAddStudent, 
  onUpdateStudent,
  onDeactivateStudent 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  
  // State untuk inline edit nama siswa
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editedName, setEditedName] = useState('');

  const filteredStudents = studentList.filter((student) =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    onAddStudent(newStudentName);
    setNewStudentName('');
  };

  const startEdit = (student) => {
    setEditingStudentId(student.id);
    setEditedName(student.full_name);
  };

  const cancelEdit = () => {
    setEditingStudentId(null);
    setEditedName('');
  };

  const handleSaveEdit = (id) => {
    if (!editedName.trim()) return;
    onUpdateStudent(id, editedName);
    setEditingStudentId(null);
    setEditedName('');
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      onDeactivateStudent(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div data-aos="fade-up" className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[#B45309] uppercase">STUDENT DATABASE</p>
          <h2 className="text-xl font-serif font-bold text-neutral-900">PEC Student Roster</h2>
        </div>
        <span className="text-xs bg-[#EFE8DC] text-[#78350F] font-bold px-3 py-1 rounded-full border border-[#E2D8C6]">
          {activeStudents} Active
        </span>
      </div>

      {/* Add Student Form (Admin Only) */}
      {isAdmin && (
        <form onSubmit={handleSubmit} className="flex gap-2 bg-white p-2 rounded-2xl border border-[#EFE8DC] shadow-sm">
          <input
            type="text"
            placeholder="Enter student full name..."
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-neutral-50 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
          <button
            type="submit"
            className="bg-[#1C1A17] text-[#FBBF24] px-4 py-2 rounded-xl text-xs font-semibold hover:bg-black transition flex items-center gap-1.5 shadow"
          >
            <UserPlus size={15} /> Add
          </button>
        </form>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-3 text-neutral-400" />
        <input
          type="text"
          placeholder="Search by student name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EFE8DC] rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-sm"
        />
      </div>

      {/* Student List */}
      <div className="flex flex-col gap-2.5">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#EFE8DC]">
            <p className="text-xs text-neutral-400">No students matched your search.</p>
          </div>
        ) : (
          filteredStudents.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#EFE8DC] flex justify-between items-center"
            >
              <div className="flex items-center gap-3 flex-1 mr-2">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-800 text-xs font-bold flex items-center justify-center border border-amber-200 shrink-0">
                  {index + 1}
                </div>

                {editingStudentId === item.id ? (
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="flex-1 px-2.5 py-1 text-xs border border-amber-400 rounded-lg bg-white focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                      title="Save"
                    >
                      <Check size={13} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1.5 rounded-lg bg-neutral-200 text-neutral-600 hover:bg-neutral-300 transition"
                      title="Cancel"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-800">{item.full_name}</h4>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-0.5">
                      <CheckCircle2 size={11} />
                      <span>Active Enrollment</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons (Admin Only) */}
              {isAdmin && editingStudentId !== item.id && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(item)}
                    className="text-neutral-400 hover:text-amber-700 p-2 rounded-xl hover:bg-amber-50 transition"
                    title="Edit Student Name"
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    onClick={() => onDeactivateStudent(item)}
                    className="text-neutral-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition"
                    title="Remove Student"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}