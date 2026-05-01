export type FacilityType =
  | 'LAB'
  | 'LECTURE_HALL'
  | 'SEMINAR_ROOM'
  | 'SPORTS_FACILITY'
  | 'STUDY_ROOM'
  | 'MEETING_ROOM'
  | 'OTHER';

export type FacilityStatus = 'ACTIVE' | 'OUT_OF_SERVICE';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  location: string;
  capacity: number;
  status: FacilityStatus;
  description: string;
}

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Booking {
  id: string;
  facilityId: string;
  facilityName: string;
  requester: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: BookingStatus;
  createdAt: string;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TicketComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: string;
  assignedTo: string;
  createdAt: string;
  comments: TicketComment[];
  attachments: string[];
}

const FACILITY_KEY = 'smartcampus.facilities.v1';
const BOOKING_KEY = 'smartcampus.bookings.v1';
const TICKET_KEY = 'smartcampus.tickets.v1';

const DEFAULT_FACILITIES: Facility[] = [
  {
    id: 'fac-101',
    name: 'Innovation Lab 101',
    type: 'LAB',
    location: 'Engineering Block',
    capacity: 28,
    status: 'ACTIVE',
    description: 'Computer-equipped lab for software engineering workshops and project demos.',
  },
  {
    id: 'fac-202',
    name: 'Lecture Hall A',
    type: 'LECTURE_HALL',
    location: 'Main Academic Wing',
    capacity: 180,
    status: 'ACTIVE',
    description: 'Large lecture venue for seminars, presentations, and guest talks.',
  },
  {
    id: 'fac-303',
    name: 'Serenity Study Room',
    type: 'STUDY_ROOM',
    location: 'Library Level 2',
    capacity: 12,
    status: 'ACTIVE',
    description: 'Quiet individual and group study space with soft seating and power access.',
  },
  {
    id: 'fac-404',
    name: 'Campus Sports Court',
    type: 'SPORTS_FACILITY',
    location: 'North Quad',
    capacity: 40,
    status: 'OUT_OF_SERVICE',
    description: 'Outdoor court for recreational activity and student events.',
  },
];

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: 'bk-001',
    facilityId: 'fac-202',
    facilityName: 'Lecture Hall A',
    requester: 'Ayesha',
    date: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '11:00',
    purpose: 'Guest lecture on cloud systems',
    status: 'APPROVED',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bk-002',
    facilityId: 'fac-101',
    facilityName: 'Innovation Lab 101',
    requester: 'Nimal',
    date: new Date().toISOString().slice(0, 10),
    startTime: '13:00',
    endTime: '15:00',
    purpose: 'Group project testing',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_TICKETS: Ticket[] = [
  {
    id: 'tk-001',
    title: 'Projector not powering on',
    description: 'The projector in Lecture Hall A does not start after three attempts.',
    category: 'INCIDENT',
    priority: 'HIGH',
    status: 'OPEN',
    createdBy: 'Ayesha',
    assignedTo: 'tech1',
    createdAt: new Date().toISOString(),
    comments: [{ id: 'c-001', author: 'tech1', content: 'Checking power supply now.', createdAt: new Date().toISOString() }],
    attachments: ['projector-error.jpg'],
  },
  {
    id: 'tk-002',
    title: 'Air conditioning service request',
    description: 'Room temperature remains high in the study room during afternoon hours.',
    category: 'MAINTENANCE',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    createdBy: 'Nimal',
    assignedTo: 'tech2',
    createdAt: new Date().toISOString(),
    comments: [],
    attachments: [],
  },
];

function loadJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, value: T): T {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getFacilities() {
  return loadJson(FACILITY_KEY, DEFAULT_FACILITIES);
}

export function addFacility(facility: Omit<Facility, 'id'>) {
  const next = [
    { ...facility, id: createId('fac') },
    ...getFacilities(),
  ];
  return saveJson(FACILITY_KEY, next);
}

export function updateFacilities(nextFacilities: Facility[]) {
  return saveJson(FACILITY_KEY, nextFacilities);
}

export function getBookings() {
  return loadJson(BOOKING_KEY, DEFAULT_BOOKINGS);
}

export function addBooking(booking: Omit<Booking, 'id' | 'createdAt'>) {
  const next = [
    { ...booking, id: createId('bk'), createdAt: new Date().toISOString() },
    ...getBookings(),
  ];
  return saveJson(BOOKING_KEY, next);
}

export function updateBookingStatus(id: string, status: BookingStatus) {
  const next = getBookings().map((booking) => (booking.id === id ? { ...booking, status } : booking));
  return saveJson(BOOKING_KEY, next);
}

export function getTickets() {
  return loadJson(TICKET_KEY, DEFAULT_TICKETS);
}

export function addTicket(ticket: Omit<Ticket, 'id' | 'createdAt' | 'comments'> & { attachments: string[] }) {
  const next = [
    { ...ticket, id: createId('tk'), createdAt: new Date().toISOString(), comments: [] },
    ...getTickets(),
  ];
  return saveJson(TICKET_KEY, next);
}

export function updateTicket(id: string, updater: (ticket: Ticket) => Ticket) {
  const next = getTickets().map((ticket) => (ticket.id === id ? updater(ticket) : ticket));
  return saveJson(TICKET_KEY, next);
}

export function addTicketComment(id: string, author: string, content: string) {
  return updateTicket(id, (ticket) => ({
    ...ticket,
    comments: [
      ...ticket.comments,
      { id: createId('c'), author, content, createdAt: new Date().toISOString() },
    ],
  }));
}

export function assignTicket(id: string, assignedTo: string) {
  return updateTicket(id, (ticket) => ({ ...ticket, assignedTo }));
}

export function changeTicketStatus(id: string, status: TicketStatus) {
  return updateTicket(id, (ticket) => ({ ...ticket, status }));
}

export function updateTicketDetails(
  id: string,
  updates: Partial<Pick<Ticket, 'title' | 'description' | 'category' | 'priority' | 'attachments' | 'assignedTo' | 'status'>>,
) {
  return updateTicket(id, (ticket) => ({ ...ticket, ...updates }));
}

export function deleteTicket(id: string) {
  const next = getTickets().filter((ticket) => ticket.id !== id);
  return saveJson(TICKET_KEY, next);
}

export function bookingsConflict(existing: Booking[], candidate: Omit<Booking, 'id' | 'createdAt'>) {
  const candidateStart = candidate.startTime;
  const candidateEnd = candidate.endTime;

  return existing.some((booking) => {
    if (booking.facilityId !== candidate.facilityId || booking.date !== candidate.date) {
      return false;
    }

    const overlaps = candidateStart < booking.endTime && candidateEnd > booking.startTime;
    return overlaps && booking.status !== 'CANCELLED' && booking.status !== 'REJECTED';
  });
}