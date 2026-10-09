'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, CurriculumModule, CourseSubmodule } from '@/types';
import {
  flagshipCourse,
  flagshipCoursesList,
  initialCurriculumModules,
} from '@/data/flagshipCourseData';

interface AdminAddModuleParams {
  courseId?: string;
  title: string;
  subtitle: string;
  weeks: string;
  certificationName?: string;
}

interface AdminEditModuleParams {
  moduleId: string;
  title: string;
  subtitle: string;
  weeks: string;
  certificationName?: string;
}

interface AdminAddSubmoduleParams {
  moduleId: string;
  title: string;
  description: string;
  duration?: string;
  videoUrl?: string;
  type?: 'video' | 'interactive' | 'challenge' | 'reading';
  takeaways?: string[];
}

interface AdminEditSubmoduleParams {
  submoduleId: string;
  title: string;
  description: string;
  duration?: string;
  videoUrl?: string;
  type?: 'video' | 'interactive' | 'challenge' | 'reading';
  takeaways?: string[];
}

interface CourseContextType {
  courses: Course[];
  activeCourse: Course;
  modules: CurriculumModule[];
  completedLessonIds: string[];
  courseProgress: number;
  totalLessons: number;
  completedLessonsCount: number;
  // Admin Operations
  adminAddModule: (params: AdminAddModuleParams) => CurriculumModule;
  adminEditModule: (params: AdminEditModuleParams) => void;
  adminDeleteModule: (moduleId: string) => void;
  adminAddSubmodule: (params: AdminAddSubmoduleParams) => CourseSubmodule;
  adminEditSubmodule: (params: AdminEditSubmoduleParams) => void;
  adminDeleteSubmodule: (submoduleId: string) => void;
  // Learner Operations
  toggleLessonComplete: (lessonId: string) => void;
  isLessonCompleted: (lessonId: string) => boolean;
  getCourseById: (courseId: string) => Course | undefined;
  getModuleById: (moduleId: string) => CurriculumModule | undefined;
  getSubmoduleById: (submoduleId: string) => CourseSubmodule | undefined;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const COURSES_STORAGE_KEY = 'aivalytics_lms_courses_v2';
const MODULES_STORAGE_KEY = 'aivalytics_lms_curriculum_modules_v2';
const COMPLETED_LESSONS_STORAGE_KEY = 'aivalytics_lms_completed_lessons_v2';

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(flagshipCoursesList);
  const [modules, setModules] = useState<CurriculumModule[]>(initialCurriculumModules);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([
    'sub_1_1',
    'sub_1_2',
    'sub_1_3',
    'sub_1_4',
  ]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedModules = localStorage.getItem(MODULES_STORAGE_KEY);
        const storedCompleted = localStorage.getItem(COMPLETED_LESSONS_STORAGE_KEY);

        if (storedModules) {
          const parsed = JSON.parse(storedModules);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setModules(parsed);
          }
        }

        if (storedCompleted) {
          const parsedComp = JSON.parse(storedCompleted);
          if (Array.isArray(parsedComp)) {
            setCompletedLessonIds(parsedComp);
          }
        }
      } catch (err) {
        console.error('Failed to load course state from localStorage', err);
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
        localStorage.setItem(COMPLETED_LESSONS_STORAGE_KEY, JSON.stringify(completedLessonIds));
      } catch (err) {
        console.error('Failed to save course state to localStorage', err);
      }
    }
  }, [modules, completedLessonIds, isLoaded]);

  // Derived metrics
  const allSubmodules = modules.flatMap((m) => m.submodules);
  const totalLessons = allSubmodules.length;
  const completedLessonsCount = allSubmodules.filter((s) =>
    completedLessonIds.includes(s.id)
  ).length;

  const courseProgress =
    totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  // Active course with dynamically computed metrics
  const activeCourse: Course = {
    ...flagshipCourse,
    totalModules: modules.length,
    totalLessons,
    completedLessons: completedLessonsCount,
    progress: courseProgress,
    modules,
  };

  // Synchronized courses array
  const currentCourses: Course[] = [activeCourse];

  // Helper getters
  const getCourseById = (courseId: string) => {
    return currentCourses.find((c) => c.id === courseId || c.code.toLowerCase() === courseId.toLowerCase()) || activeCourse;
  };

  const getModuleById = (moduleId: string) => {
    return modules.find((m) => m.id === moduleId);
  };

  const getSubmoduleById = (submoduleId: string) => {
    return allSubmodules.find((s) => s.id === submoduleId);
  };

  const isLessonCompleted = (lessonId: string) => {
    return completedLessonIds.includes(lessonId);
  };

  // Learner Action: Toggle lesson completion
  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessonIds((prev) => {
      const isAlreadyDone = prev.includes(lessonId);
      const next = isAlreadyDone
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId];
      return next;
    });
  };

  // Admin Action: Add Module
  const adminAddModule = ({
    title,
    subtitle,
    weeks,
    certificationName,
  }: AdminAddModuleParams): CurriculumModule => {
    const nextNumber = modules.length + 1;
    const newModule: CurriculumModule = {
      id: `mod_${Date.now()}`,
      courseId: activeCourse.id,
      moduleNumber: nextNumber,
      title: title.trim(),
      subtitle: subtitle.trim(),
      weeks: weeks.trim(),
      certificationName: certificationName?.trim() || `${title.trim()} Certified`,
      order: nextNumber,
      status: 'upcoming',
      submodules: [],
    };

    setModules((prev) => [...prev, newModule]);
    return newModule;
  };

  // Admin Action: Edit Module
  const adminEditModule = ({
    moduleId,
    title,
    subtitle,
    weeks,
    certificationName,
  }: AdminEditModuleParams) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        return {
          ...m,
          title: title.trim(),
          subtitle: subtitle.trim(),
          weeks: weeks.trim(),
          certificationName: certificationName ? certificationName.trim() : m.certificationName,
        };
      })
    );
  };

  // Admin Action: Delete Module
  const adminDeleteModule = (moduleId: string) => {
    setModules((prev) => {
      const filtered = prev.filter((m) => m.id !== moduleId);
      // Re-number modules sequentially
      return filtered.map((m, idx) => ({
        ...m,
        moduleNumber: idx + 1,
        order: idx + 1,
      }));
    });
  };

  // Admin Action: Add Sub-module (Lesson)
  const adminAddSubmodule = ({
    moduleId,
    title,
    description,
    duration = '45m',
    videoUrl,
    type = 'video',
    takeaways = [],
  }: AdminAddSubmoduleParams): CourseSubmodule => {
    const targetModule = modules.find((m) => m.id === moduleId);
    const modNumber = targetModule?.moduleNumber || 1;
    const currentSubCount = (targetModule?.submodules.length || 0) + 1;

    const newSubmodule: CourseSubmodule = {
      id: `sub_${Date.now()}`,
      moduleId,
      subpartCode: `${modNumber}.${currentSubCount}`,
      title: title.trim(),
      description: description.trim(),
      duration: duration.trim(),
      videoUrl: videoUrl?.trim() || 'https://example.com/videos/lecture-placeholder',
      type,
      isCompleted: false,
      order: currentSubCount,
      takeaways: takeaways.length > 0 ? takeaways : ['Key framework application & execution best practices.'],
      resources: [
        { name: `${title.replace(/\s+/g, '_')}_Study_Guide.pdf`, url: '#', size: '1.8 MB' },
      ],
    };

    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        return {
          ...m,
          submodules: [...m.submodules, newSubmodule],
        };
      })
    );

    return newSubmodule;
  };

  // Admin Action: Edit Submodule
  const adminEditSubmodule = ({
    submoduleId,
    title,
    description,
    duration,
    videoUrl,
    type,
    takeaways,
  }: AdminEditSubmoduleParams) => {
    setModules((prev) =>
      prev.map((m) => {
        const hasSub = m.submodules.some((s) => s.id === submoduleId);
        if (!hasSub) return m;

        return {
          ...m,
          submodules: m.submodules.map((s) => {
            if (s.id !== submoduleId) return s;
            return {
              ...s,
              title: title.trim(),
              description: description.trim(),
              duration: duration ? duration.trim() : s.duration,
              videoUrl: videoUrl ? videoUrl.trim() : s.videoUrl,
              type: type || s.type,
              takeaways: takeaways || s.takeaways,
            };
          }),
        };
      })
    );
  };

  // Admin Action: Delete Submodule
  const adminDeleteSubmodule = (submoduleId: string) => {
    setModules((prev) =>
      prev.map((m) => {
        const hasSub = m.submodules.some((s) => s.id === submoduleId);
        if (!hasSub) return m;

        const filtered = m.submodules.filter((s) => s.id !== submoduleId);
        // Re-index subpart codes
        const reindexed = filtered.map((s, idx) => ({
          ...s,
          subpartCode: `${m.moduleNumber}.${idx + 1}`,
          order: idx + 1,
        }));

        return {
          ...m,
          submodules: reindexed,
        };
      })
    );
  };

  return (
    <CourseContext.Provider
      value={{
        courses: currentCourses,
        activeCourse,
        modules,
        completedLessonIds,
        courseProgress,
        totalLessons,
        completedLessonsCount,
        adminAddModule,
        adminEditModule,
        adminDeleteModule,
        adminAddSubmodule,
        adminEditSubmodule,
        adminDeleteSubmodule,
        toggleLessonComplete,
        isLessonCompleted,
        getCourseById,
        getModuleById,
        getSubmoduleById,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = (): CourseContextType => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};
