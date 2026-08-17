export interface ModuleResource {
  title: string;
  url: string;
}

export interface FormationModule {
  id: string;
  title: string;
  position: number;
  youtube_video_id: string | null;
  resources: ModuleResource[];
  completed: boolean;
}

export interface FormationCourse {
  id: string;
  slug: string;
  title: string;
  modules: FormationModule[];
}
