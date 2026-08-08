// pages/DashboardPage.js — "My Resumes": list, edit, duplicate, delete saved resumes
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllResumes, addResume, deleteResume } from "../services/resumeService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  IconBuilding, IconCopy, IconEdit, IconFile, IconMoon, IconPalette, IconPlus, IconRocket, IconTrash,
} from "../components/Icons";

const TEMPLATE_META = {
  1: { name: "Classic Professional", gradient: "linear-gradient(135deg, #1e1e3f 0%, #6c63ff 100%)", Icon: IconBuilding },
  2: { name: "Modern Dark", gradient: "linear-gradient(135deg, #1a0a2e 0%, #16213e 100%)", Icon: IconMoon },
  3: { name: "Creative Gradient", gradient: "linear-gradient(135deg, #f72585 0%, #4cc9f0 100%)", Icon: IconPalette },
};

const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const SkeletonCard = () => (
  <div className="resume-card skeleton-card">
    <div className="skeleton-block" style={{ height: 90 }} />
    <div className="resume-card-body">
      <div className="skeleton-block" style={{ height: 16, width: "70%", marginBottom: 8 }} />
      <div className="skeleton-block" style={{ height: 12, width: "45%" }} />
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadResumes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllResumes();
      setResumes(data);
    } catch (err) {
      showToast("error", "Failed to load your resumes. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadResumes(); }, [loadResumes]);

  const handleDuplicate = async (resume) => {
    setBusyId(resume._id);
    try {
      const { _id, createdAt, updatedAt, __v, ...rest } = resume;
      const copy = await addResume({ ...rest, name: `${rest.name} (Copy)` });
      setResumes((prev) => [copy, ...prev]);
      showToast("success", "Resume duplicated!");
    } catch {
      showToast("error", "Failed to duplicate resume.");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    const target = deleteTarget;
    setDeleteTarget(null);
    setBusyId(target._id);
    try {
      await deleteResume(target._id);
      setResumes((prev) => prev.filter((r) => r._id !== target._id));
      showToast("success", "Resume deleted.");
    } catch {
      showToast("error", "Failed to delete resume.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>My Resumes</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 4 }}>
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""} — pick up where you left off.
          </p>
        </div>
        <Link to="/templates" className="btn-primary" id="dashboard-new-btn">
          <IconPlus size={17} /> Create New Resume
        </Link>
      </div>

      {loading ? (
        <div className="resume-grid">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : resumes.length === 0 ? (
        <div className="dashboard-empty">
          <div className="empty-preview-icon"><IconFile size={40} /></div>
          <h3>No resumes yet</h3>
          <p>Create your first AI-powered resume in minutes.</p>
          <Link to="/templates" className="btn-primary" style={{ marginTop: 16 }}>
            <IconRocket size={18} /> Start Building
          </Link>
        </div>
      ) : (
        <div className="resume-grid">
          {resumes.map((resume) => {
            const meta = TEMPLATE_META[resume.templateId] || TEMPLATE_META[1];
            const isBusy = busyId === resume._id;
            return (
              <div key={resume._id} className={`resume-card ${isBusy ? "is-busy" : ""}`}>
                <div className="resume-card-banner" style={{ background: meta.gradient }}>
                  <meta.Icon size={22} />
                  <span className="resume-card-ats">ATS {resume.atsScore || 0}/100</span>
                </div>
                <div className="resume-card-body">
                  <div className="resume-card-name">{resume.name || "Untitled"}</div>
                  <div className="resume-card-role">{resume.role || "No role set"}</div>
                  <div className="resume-card-meta">
                    {meta.name} • Updated {formatDate(resume.updatedAt)}
                  </div>
                  <div className="resume-card-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => navigate(`/builder/${resume._id}`)}
                      disabled={isBusy}
                    >
                      <IconEdit size={15} /> Edit
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => handleDuplicate(resume)}
                      disabled={isBusy}
                    >
                      {isBusy
                        ? <span className="loading-spinner" />
                        : <><IconCopy size={15} /> Duplicate</>}
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => setDeleteTarget(resume)}
                      disabled={isBusy}
                      aria-label={`Delete ${resume.name || "resume"}`}
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this resume?"
        message={`"${deleteTarget?.name || "This resume"}" will be permanently deleted. This can't be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default DashboardPage;
