export interface ModuleResource {
  title: string;
  url: string;
}

export interface FormationLesson {
  id: string;
  title: string;
  position: number;
  youtube_video_id: string | null;
  completed: boolean;
}

export interface FormationModule {
  id: string;
  title: string;
  position: number;
  lessons: FormationLesson[];
  resources: ModuleResource[];
  /** Vrai uniquement quand toutes les leçons du module sont terminées. */
  completed: boolean;
}

export interface FormationCourse {
  id: string;
  slug: string;
  title: string;
  modules: FormationModule[];
}
