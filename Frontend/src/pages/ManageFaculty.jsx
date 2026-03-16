import { useState, useEffect } from "react";
import { Search, CheckCircle, AlertCircle } from "lucide-react";

import Sidebar              from "../components/Sidebar";
import Footer               from "../components/Footer";
import FacultyCard          from "../components/FacultyCard";
import SearchBarAndFilter   from "../components/SearchBarAndFilter";
import Pagination           from "../components/Pagination";
import SubjectsModal        from "../components/SubjectsModal";
import EditFacultyModal     from "../components/EditFacultyModal";
import ConfirmModal         from "../components/ConfirmModal";
import { DEPARTMENTS }      from "../components/FacultyForm";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 15;

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
// API INTEGRATION — replace `const [allFaculties] = useState(MOCK_FACULTIES)`
// with the fetch block below:
//
//   const [allFaculties, setAllFaculties] = useState([]);
//   const [fetching,     setFetching]     = useState(false);
//
//   useEffect(() => {
//     setFetching(true);
//     const token  = JSON.parse(sessionStorage.getItem("vit_user") ?? "{}")?.token;
//     const params = new URLSearchParams({ page, limit: PAGE_SIZE });
//     if (search) params.set("search", search);
//     if (dept)   params.set("dept",   dept);
//     fetch(`/api/admin/faculty?${params}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((r) => r.json())
//       .then((d) => {
//         setAllFaculties(d.faculties);
//         setTotalPages(Math.ceil(d.total / PAGE_SIZE));
//       })
//       .catch(() => showToast("Failed to load faculty.", "error"))
//       .finally(() => setFetching(false));
//   }, [page, search, dept]);
//
// Expected GET response shape:
//   { faculties: [...], total: 42, page: 1, totalPages: 3 }
//
// DELETE /api/admin/faculty/:id  → { message }
// ─────────────────────────────────────────────────────────────────────────────
const mk = (id, name, dept, role, desig, subjects) => ({
  _id: String(id),
  fullName: name,
  email: `${name.toLowerCase().replace(/[\s.]+/g, ".")}@vit.edu.in`,
  department: dept,
  role,
  designation: role === "HOD" ? "Head of Department" : desig,
  subjects,
  isActive: true,
});

const MOCK_FACULTIES = [
  mk(1,  "Dr. Sarah Jenkins",     "CMPN",   "HOD",     "",                   [{ _id:"s1",  name:"DSA",             code:"CMPN301", semester:"V",    department:"CMPN"   }, { _id:"s2",  name:"ML",              code:"CMPN401", semester:"VII",  department:"CMPN"   }, { _id:"s3",  name:"Cloud Computing",  code:"CMPN402", semester:"VII",  department:"CMPN"   }]),
  mk(2,  "Prof. Michael Chen",    "INFT",   "Faculty", "Assistant Professor", [{ _id:"s4",  name:"Web Dev",          code:"INFT302", semester:"V",    department:"INFT"   }, { _id:"s5",  name:"DBMS",             code:"INFT303", semester:"V",    department:"INFT"   }]),
  mk(3,  "Dr. Elena Rodriguez",   "EXTC",   "Faculty", "Associate Professor", [{ _id:"s6",  name:"Thermodynamics",   code:"EXTC201", semester:"III",  department:"EXTC"   }, { _id:"s7",  name:"Fluid Mechanics",  code:"EXTC202", semester:"III",  department:"EXTC"   }]),
  mk(4,  "Prof. Ravi Sharma",     "INFT",   "Faculty", "Professor",           [{ _id:"s8",  name:"OS",               code:"INFT201", semester:"III",  department:"INFT"   }, { _id:"s9",  name:"CN",               code:"INFT202", semester:"IV",   department:"INFT"   }]),
  mk(5,  "Dr. Anita Desai",       "BIOMED", "HOD",     "",                   [{ _id:"s10", name:"Bio Signals",       code:"BIO301",  semester:"V",    department:"BIOMED" }]),
  mk(6,  "Prof. Kiran Patil",     "EXCS",   "Faculty", "Lecturer",            [{ _id:"s11", name:"Digital Systems",  code:"EXCS101", semester:"I",    department:"EXCS"   }, { _id:"s12", name:"VLSI",              code:"EXCS302", semester:"V",    department:"EXCS"   }]),
  mk(7,  "Dr. Neha Joshi",        "CMPN",   "Faculty", "Assistant Professor", [{ _id:"s13", name:"AI",               code:"CMPN303", semester:"V",    department:"CMPN"   }]),
  mk(8,  "Prof. Suresh Kulkarni", "FE",     "Faculty", "Lecturer",            [{ _id:"s14", name:"Maths I",           code:"FE101",   semester:"I",    department:"FE"     }, { _id:"s15", name:"Maths II",          code:"FE102",   semester:"II",   department:"FE"     }]),
  mk(9,  "Dr. Priya Mehra",       "CMPN",   "Faculty", "Professor",           [{ _id:"s16", name:"Compiler Design",  code:"CMPN404", semester:"VII",  department:"CMPN"   }]),
  mk(10, "Prof. Amit Jain",       "EXTC",   "Faculty", "Associate Professor", [{ _id:"s17", name:"Signals",           code:"EXTC301", semester:"V",    department:"EXTC"   }, { _id:"s18", name:"Control Systems",  code:"EXTC302", semester:"V",    department:"EXTC"   }]),
  mk(11, "Dr. Seema Nair",        "INFT",   "HOD",     "",                   [{ _id:"s19", name:"SEM",                code:"INFT401", semester:"VII",  department:"INFT"   }]),
  mk(12, "Prof. Raj Bhatia",      "FE",     "Faculty", "Lecturer",            [{ _id:"s20", name:"Physics",            code:"FE103",   semester:"I",    department:"FE"     }]),
  mk(13, "Dr. Kavita Singh",      "BIOMED", "Faculty", "Assistant Professor", [{ _id:"s21", name:"Medical Imaging",  code:"BIO401",  semester:"VII",  department:"BIOMED" }]),
  mk(14, "Prof. Alok Verma",      "EXCS",   "Faculty", "Associate Professor", [{ _id:"s22", name:"Embedded Systems", code:"EXCS401", semester:"VII",  department:"EXCS"   }]),
  mk(15, "Dr. Pooja Rawat",       "CMPN",   "Faculty", "Professor",           [{ _id:"s23", name:"Big Data",          code:"CMPN405", semester:"VIII", department:"CMPN"   }, { _id:"s24", name:"NLP",               code:"CMPN406", semester:"VIII", department:"CMPN"   }]),
  mk(16, "Prof. Dinesh More",     "EXTC",   "Faculty", "Lecturer",            [{ _id:"s25", name:"Microwave Engg",   code:"EXTC401", semester:"VII",  department:"EXTC"   }]),
  mk(17, "Dr. Smita Ghosh",       "INFT",   "Faculty", "Assistant Professor", [{ _id:"s26", name:"IoT",               code:"INFT303", semester:"VI",   department:"INFT"   }]),
];

// ─────────────────────────────────────────────────────────────────────────────
// TOAST  (local — not a shared component to avoid over-engineering)
// ─────────────────────────────────────────────────────────────────────────────
const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-100 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium bg-white border ${
      toast.type === "success" ? "border-green-200 text-green-700" : "border-red-200 text-red-600"
    }`}>
      {toast.type === "success"
        ? <CheckCircle size={18} className="text-green-500" />
        : <AlertCircle size={18} className="text-red-400" />}
      {toast.message}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MANAGE FACULTY — page root
// All component logic lives in the imported files; this file only handles:
//   • data / filter / pagination state
//   • modal open/close state
//   • DELETE API call
//   • wiring props to child components
// ─────────────────────────────────────────────────────────────────────────────
const ManageFaculty = () => {
  // ── Data ──────────────────────────────────────────────────────────────────
  const [allFaculties, setAllFaculties] = useState(MOCK_FACULTIES);
  const [fetching,     setFetching]     = useState(false);

  // ── Filter / pagination ────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [dept,   setDept]   = useState("");
  const [page,   setPage]   = useState(1);

  // ── Modal targets ──────────────────────────────────────────────────────────
  const [subjectsTarget,  setSubjectsTarget]  = useState(null);
  const [editTarget,      setEditTarget]      = useState(null);
  const [deleteTarget,    setDeleteTarget]    = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Client-side filter (replaced by server params when API is connected) ───
  const filtered = allFaculties.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      f.fullName.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q);
    return matchSearch && (!dept || f.department === dept);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 whenever filter changes
  useEffect(() => { setPage(1); }, [search, dept]);

  // ── Faculty update helper — shared by EditFacultyModal + SubjectsModal ─────
  const handleFacultyUpdate = (id, patch) => {
    setAllFaculties((prev) => prev.map((f) => f._id === id ? { ...f, ...patch } : f));
    // Keep modal targets in sync so they reflect the latest data immediately
    setEditTarget((t)     => t?._id === id ? { ...t, ...patch } : t);
    setSubjectsTarget((t) => t?._id === id ? { ...t, ...patch } : t);
  };

  // ── DELETE ── DELETE /api/admin/faculty/:id ────────────────────────────────
  // Called by ConfirmModal's onConfirm.
  // On success: removes the faculty from local state + closes modal.
  const handleDeleteConfirm = async () => {
    setDeletingLoading(true);
    try {
      const token = JSON.parse(sessionStorage.getItem("vit_user") ?? "{}")?.token;
      const res   = await fetch(`/api/admin/faculty/${deleteTarget._id}`, {
        method:  "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (!res.ok) { showToast(data?.message || "Failed to delete.", "error"); return; }
      setAllFaculties((prev) => prev.filter((f) => f._id !== deleteTarget._id));
      showToast(`${deleteTarget.fullName} removed.`);
      setDeleteTarget(null);
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setDeletingLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="ml-60 flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-8 py-8">

          {/* ── Page header ───────────────────────────────────────────── */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">Manage Faculty</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {filtered.length}{" "}
              {filtered.length === 1 ? "faculty member" : "faculty members"}
              {dept ? ` in ${dept}` : " across all departments"}
            </p>
          </div>

          {/* ── Search + Department filter ─────────────────────────────── */}
          <SearchBarAndFilter
            search={search}
            onSearch={setSearch}
            dept={dept}
            onDept={setDept}
            departments={DEPARTMENTS}
          />

          {/* ── Faculty grid ──────────────────────────────────────────── */}
          {fetching ? (
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-300">
              <Search size={36} className="mb-3" />
              <p className="text-base font-medium">No faculty found</p>
              <p className="text-sm mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {paginated.map((f) => (
                <FacultyCard
                  key={f._id}
                  faculty={f}
                  showActions={true}
                  onSubjects={setSubjectsTarget}
                  onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}

          {/* ── Pagination ────────────────────────────────────────────── */}
          {!fetching && filtered.length > PAGE_SIZE && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPage={(p) => { if (p >= 1 && p <= totalPages) setPage(p); }}
            />
          )}

        </main>
        <Footer />
      </div>

      {/* ── Modals ────────────────────────────────────────────────────── */}
      <SubjectsModal
        open={!!subjectsTarget}
        onClose={() => setSubjectsTarget(null)}
        faculty={subjectsTarget}
        onFacultyUpdate={handleFacultyUpdate}
        showToast={showToast}
      />

      <EditFacultyModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        faculty={editTarget}
        onFacultyUpdate={handleFacultyUpdate}
        showToast={showToast}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Faculty"
        message={
          <>
            Are you sure you want to remove{" "}
            <span className="font-semibold text-gray-800">{deleteTarget?.fullName}</span>{" "}
            from the system? This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        loading={deletingLoading}
      />

      <Toast toast={toast} />
    </div>
  );
};

export default ManageFaculty;