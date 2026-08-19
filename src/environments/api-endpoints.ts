export const API_ENDPOINTS = {
  auth: {
    name: 'auth',
    services: {
      register: 'register',
      login: 'login',
      refresh: 'refresh',
      me: 'me',
      logout: 'logout',
    },
  },
  tenants: {
    name: 'tenants',
  },
  participants: {
    name: 'participants',
    services: {
      guardians: 'guardians',
      fieldNotes: 'field-notes',
    },
  },
  programs: {
    name: 'programs',
    services: {
      thumbnail: 'thumbnail',
      publish: 'publish',
      unpublish: 'unpublish',
      modules: 'modules',
      activities: 'activities',
    },
  },
  enrollments: {
    name: 'enrollments',
    services: {
      progress: 'progress',
    },
  },
  submissions: {
    name: 'submissions',
    services: {
      submit: 'submit',
      review: 'review',
    },
  },
  fieldNotes: {
    name: 'field-notes',
  },
  journal: {
    name: 'journal',
  },
  planning: {
    name: 'planning',
    services: {
      boards: 'boards',
      columns: 'columns',
      tasks: 'tasks',
      move: 'move',
    },
  },
  billing: {
    name: 'billing',
    services: {
      plans: 'plans',
      current: 'current',
      subscriptions: 'subscriptions',
      swap: 'swap',
      cancel: 'cancel',
      portal: 'portal',
      invoices: 'invoices',
    },
  },
};
