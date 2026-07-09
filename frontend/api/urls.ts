const host = "/api/proxy";

export const LIST_PROJECTS = `${host}/projects`;
export const LIST_TASKS = `${host}/tasks`;
export const LIST_USERS = `${host}/users`;
export const LIST_NOTIFICATIONS   = `${host}/notifications`;

export const GET_PROJECT = (id: string) => `${host}/projects/${id}`;
export const GET_TASK = (id: string) => `${host}/tasks/${id}`;
export const UNREAD_COUNT         = `${host}/notifications/unread`;

export const UPDATE_PROJECT_STATUS = (id: string) => `${host}/projects/${id}/status`;
export const UPDATE_PROJECT = (id: string) => `${host}/projects/${id}`;
export const UPDATE_TASK_STATUS = (id: string) => `${host}/tasks/${id}/status`;
export const UPDATE_TASK = (id: string) => `${host}/tasks/${id}`;
export const MARK_AS_READ         = (id: string) => `${host}/notifications/${id}/read`;
export const MARK_ALL_AS_READ     = `${host}/notifications/read-all`;

export const LOGIN_USER = `${host}/auth/login`;
export const INVITE_USER = `${host}/auth/invite`;
export const USER_ACCEPT_INVITE = `${host}/auth/accept-invite`;
export const CREATE_PROJECT = `${host}/projects`;
export const CREATE_TASK = (projectId: string) => `${host}/projects/${projectId}/tasks`;

export const DELETE_PROJECT = (id: string) => `${host}/projects/${id}`;
export const DELETE_TASK = (id: string) => `${host}/tasks/${id}`;
export const DELETE_NOTIFICATION  = (id: string) => `${host}/notifications/${id}`;