export type * from './auth';

export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
};

export type Calendar = {
    id: number;
    owner_id: number;
    name: string;
    uuid: string;
    description: string | null;
    visibility: 'public' | 'private';
    color: string;
    allow_member_event_creation: boolean;
    created_at: string;
    updated_at: string;
    owner?: User;
    members?: CalendarMember[];
    events?: Event[];
    upcoming_events_count?: number;
    members_count?: number;
    pending_requests_count?: number;
};

export type CalendarMember = User & {
    pivot: {
        role: 'owner' | 'member';
    };
};

export type CalendarJoinRequest = {
    id: number;
    calendar_id: number;
    user_id: number;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_by: number | null;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
    user?: User;
    reviewer?: User;
};

export type Event = {
    id: number;
    calendar_id: number;
    creator_id: number;
    title: string;
    description: string | null;
    type: 'meeting' | 'deadline' | 'exam' | 'presentation' | 'event' | 'other';
    start_at: string;
    end_at: string | null;
    location: string | null;
    meeting_url: string | null;
    created_at: string;
    updated_at: string;
    calendar?: Calendar;
    creator?: User;
    attendees?: EventAttendee[];
    comments?: Comment[];
};

export type EventAttendee = User & {
    pivot: {
        status: 'attending' | 'maybe' | 'not_attending';
    };
};

export type Comment = {
    id: number;
    event_id: number;
    user_id: number;
    body: string;
    created_at: string;
    updated_at: string;
    user?: User;
};

export type NotificationPreferences = {
    id: number;
    user_id: number;
    new_events: boolean;
    event_updates: boolean;
    event_deletions: boolean;
    event_reminders: boolean;
    reminder_minutes: number | null;
    created_at: string;
    updated_at: string;
};

export const EVENT_TYPES = {
    meeting: 'Reunião',
    deadline: 'Prazo',
    exam: 'Prova',
    presentation: 'Apresentação',
    event: 'Evento',
    other: 'Outro',
} as const;

export type EventTypeKey = keyof typeof EVENT_TYPES;

export type PageProps<T = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    flash: {
        message?: string;
        error?: string;
    };
};

export type SharedData = {
    auth: {
        user: User;
    };
    sidebarOpen: boolean;
    totalPendingRequests: number;
    [key: string]: unknown;
};
