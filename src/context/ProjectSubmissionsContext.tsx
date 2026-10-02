'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ProjectModule,
  ProjectSubpart,
  StudentProjectSubmission,
  ProjectSubmissionStats,
  SubmissionReviewStatus,
  SubmittedFile,
} from '@/types';
import {
  initialProjectModules,
  initialProjectSubmissions,
} from '@/data/projectSubmissionsData';

interface SubmitProjectParams {
  moduleId: string;
  subpartId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  files: SubmittedFile[];
  links: string[];
  studentNotes?: string;
}

interface AdminAddSubpartParams {
  moduleId: string;
  title: string;
  description: string;
  deadline: string;
  allowedFormats: ('pdf' | 'doc' | 'ppt' | 'image' | 'link')[];
  maxPoints?: number;
  guidelines?: string[];
}

interface AdminGiveRemarkParams {
  submissionId: string;
  remarks: string;
  status: SubmissionReviewStatus;
  score?: number;
  evaluatorName?: string;
}

interface ProjectSubmissionsContextType {
  modules: ProjectModule[];
  submissions: StudentProjectSubmission[];
  stats: ProjectSubmissionStats;
  submitProject: (params: SubmitProjectParams) => StudentProjectSubmission;
  adminAddModule: (moduleData: {
    title: string;
    subtitle: string;
    weeks: string;
    miniChallenge: string;
    deliverableBuild: string;
    certificationName?: string;
  }) => ProjectModule;
  adminAddSubpart: (params: AdminAddSubpartParams) => ProjectSubpart;
  adminUpdateDeadline: (subpartId: string, newDeadline: string) => void;
  adminDeleteSubpart: (subpartId: string) => void;
  adminGiveRemark: (params: AdminGiveRemarkParams) => void;
  getSubmissionsByStudent: (studentEmail: string) => StudentProjectSubmission[];
  getSubmissionsBySubpart: (subpartId: string) => StudentProjectSubmission[];
  getStudentSubpartSubmission: (
    studentEmail: string,
    subpartId: string
  ) => StudentProjectSubmission | undefined;
  getModuleById: (moduleId: string) => ProjectModule | undefined;
}

const ProjectSubmissionsContext = createContext<ProjectSubmissionsContextType | undefined>(
  undefined
);

const MODULES_STORAGE_KEY = 'aivalytics_lms_modules_v1';
const SUBMISSIONS_STORAGE_KEY = 'aivalytics_lms_project_submissions_v1';

export const ProjectSubmissionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [modules, setModules] = useState<ProjectModule[]>(initialProjectModules);
  const [submissions, setSubmissions] =
    useState<StudentProjectSubmission[]>(initialProjectSubmissions);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedModules = localStorage.getItem(MODULES_STORAGE_KEY);
        const storedSubmissions = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);

        if (storedModules) {
          setModules(JSON.parse(storedModules));
        }
        if (storedSubmissions) {
          setSubmissions(JSON.parse(storedSubmissions));
        }
      } catch (err) {
        console.error('Failed to load project submissions from localStorage', err);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(modules));
        localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
      } catch (err) {
        console.error('Failed to save project submissions to localStorage', err);
      }
    }
  }, [modules, submissions, isLoaded]);

  // Derived Stats
  const totalSubparts = modules.reduce((sum, m) => sum + m.subparts.length, 0);
  const totalSubmissions = submissions.length;
  const pendingReview = submissions.filter((s) => s.status === 'PENDING_REVIEW').length;
  const approvedCount = submissions.filter(
    (s) => s.status === 'APPROVED' || s.status === 'EXCELLENT'
  ).length;
  const revisionRequestedCount = submissions.filter(
    (s) => s.status === 'REVISION_REQUESTED'
  ).length;

  const stats: ProjectSubmissionStats = {
    totalSubparts,
    totalSubmissions,
    pendingReview,
    approvedCount,
    revisionRequestedCount,
  };

  // Submit Project (Student Action)
  const submitProject = ({
    moduleId,
    subpartId,
    studentId,
    studentName,
    studentEmail,
    files,
    links,
    studentNotes,
  }: SubmitProjectParams): StudentProjectSubmission => {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })} • ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    // Find parent module to find maxPoints for subpart
    const targetModule = modules.find((m) => m.id === moduleId);
    const targetSubpart = targetModule?.subparts.find((s) => s.id === subpartId);
    const maxPoints = targetSubpart?.maxPoints || 100;

    // Check if an existing submission exists for this student & subpart
    const existingIndex = submissions.findIndex(
      (s) =>
        s.subpartId === subpartId &&
        s.studentEmail.toLowerCase() === studentEmail.toLowerCase()
    );

    let updatedSubmission: StudentProjectSubmission;

    if (existingIndex >= 0) {
      // Overwrite/update with new revision
      updatedSubmission = {
        ...submissions[existingIndex],
        files,
        links,
        studentNotes: studentNotes || submissions[existingIndex].studentNotes,
        submittedAt: formattedDate,
        status: 'PENDING_REVIEW', // Reset to pending review upon resubmission
      };

      setSubmissions((prev) => {
        const next = [...prev];
        next[existingIndex] = updatedSubmission;
        return next;
      });
    } else {
      // Create new submission record
      updatedSubmission = {
        id: `subm_${Date.now()}`,
        moduleId,
        subpartId,
        studentId,
        studentName,
        studentEmail,
        submittedAt: formattedDate,
        files,
        links,
        studentNotes,
        status: 'PENDING_REVIEW',
        maxPoints,
      };

      setSubmissions((prev) => [updatedSubmission, ...prev]);
    }

    return updatedSubmission;
  };

  // Admin Add New Project Module
  const adminAddModule = (moduleData: {
    title: string;
    subtitle: string;
    weeks: string;
    miniChallenge: string;
    deliverableBuild: string;
    certificationName?: string;
  }): ProjectModule => {
    const nextNumber = modules.length + 1;
    const newModule: ProjectModule = {
      id: `mod_${Date.now()}`,
      moduleNumber: nextNumber,
      title: moduleData.title,
      subtitle: moduleData.subtitle,
      weeks: moduleData.weeks,
      miniChallenge: moduleData.miniChallenge,
      deliverableBuild: moduleData.deliverableBuild,
      certificationName: moduleData.certificationName || `${moduleData.title} Certified`,
      subparts: [],
      status: 'upcoming',
    };

    setModules((prev) => [...prev, newModule]);
    return newModule;
  };

  // Admin Add Subpart with Deadline
  const adminAddSubpart = ({
    moduleId,
    title,
    description,
    deadline,
    allowedFormats,
    maxPoints = 100,
    guidelines = [],
  }: AdminAddSubpartParams): ProjectSubpart => {
    const targetModule = modules.find((m) => m.id === moduleId);
    const subpartCount = (targetModule?.subparts.length || 0) + 1;
    const modNum = targetModule?.moduleNumber || 1;

    const newSubpart: ProjectSubpart = {
      id: `sub_${Date.now()}`,
      moduleId,
      subpartCode: `${modNum}.${subpartCount}`,
      title,
      description,
      deadline,
      allowedFormats,
      maxPoints,
      guidelines: guidelines.length > 0 ? guidelines : ['Ensure submission meets evaluation rubrics.'],
    };

    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id === moduleId) {
          return {
            ...mod,
            subparts: [...mod.subparts, newSubpart],
          };
        }
        return mod;
      })
    );

    return newSubpart;
  };

  // Admin Update Deadline
  const adminUpdateDeadline = (subpartId: string, newDeadline: string) => {
    setModules((prev) =>
      prev.map((mod) => ({
        ...mod,
        subparts: mod.subparts.map((sub) =>
          sub.id === subpartId ? { ...sub, deadline: newDeadline } : sub
        ),
      }))
    );
  };

  // Admin Delete Subpart
  const adminDeleteSubpart = (subpartId: string) => {
    setModules((prev) =>
      prev.map((mod) => ({
        ...mod,
        subparts: mod.subparts.filter((sub) => sub.id !== subpartId),
      }))
    );
    setSubmissions((prev) => prev.filter((s) => s.subpartId !== subpartId));
  };

  // Admin Give Remark & Grade
  const adminGiveRemark = ({
    submissionId,
    remarks,
    status,
    score,
    evaluatorName = 'Admin Faculty',
  }: AdminGiveRemarkParams) => {
    const now = new Date();
    const evaluatedAt = `${now.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })} • ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    setSubmissions((prev) =>
      prev.map((subm) => {
        if (subm.id === submissionId) {
          return {
            ...subm,
            adminRemarks: remarks,
            status,
            score: score !== undefined ? score : subm.score,
            adminEvaluatedAt: evaluatedAt,
            adminEvaluatorName: evaluatorName,
          };
        }
        return subm;
      })
    );
  };

  // Helper Queries
  const getSubmissionsByStudent = (studentEmail: string) => {
    return submissions.filter(
      (s) => s.studentEmail.toLowerCase() === studentEmail.toLowerCase()
    );
  };

  const getSubmissionsBySubpart = (subpartId: string) => {
    return submissions.filter((s) => s.subpartId === subpartId);
  };

  const getStudentSubpartSubmission = (studentEmail: string, subpartId: string) => {
    return submissions.find(
      (s) =>
        s.subpartId === subpartId &&
        s.studentEmail.toLowerCase() === studentEmail.toLowerCase()
    );
  };

  const getModuleById = (moduleId: string) => {
    return modules.find((m) => m.id === moduleId);
  };

  return (
    <ProjectSubmissionsContext.Provider
      value={{
        modules,
        submissions,
        stats,
        submitProject,
        adminAddModule,
        adminAddSubpart,
        adminUpdateDeadline,
        adminDeleteSubpart,
        adminGiveRemark,
        getSubmissionsByStudent,
        getSubmissionsBySubpart,
        getStudentSubpartSubmission,
        getModuleById,
      }}
    >
      {children}
    </ProjectSubmissionsContext.Provider>
  );
};

export const useProjectSubmissions = (): ProjectSubmissionsContextType => {
  const context = useContext(ProjectSubmissionsContext);
  if (!context) {
    throw new Error(
      'useProjectSubmissions must be used within a ProjectSubmissionsProvider'
    );
  }
  return context;
};
