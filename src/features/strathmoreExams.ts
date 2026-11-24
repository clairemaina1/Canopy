export type StrathmoreExam = {
  code: string;
  name: string;
  examDate: string;
  examTime: string;
  group: string;
  venue: string;
  lecturer: string;
};

export const strathmoreExamSchedule: StrathmoreExam[] = [
  {
    code: 'BBT 3104',
    name: 'Advanced Database Systems',
    examDate: '2026-12-02',
    examTime: '11:00 – 13:00',
    group: 'BBIT 2.2C Aug - Dec 26',
    venue: 'FORGE GF-01',
    lecturer: 'E. Muli',
  },
  {
    code: 'BBT 2201',
    name: 'Computer Organizations and Architecture',
    examDate: '2026-12-03',
    examTime: '16:00 – 18:00',
    group: 'BBIT 2.2C Aug - Dec 26',
    venue: 'FORGE GF-01',
    lecturer: 'D. Mango',
  },
  {
    code: 'BBT 2101',
    name: 'Business Systems Analysis',
    examDate: '2026-12-07',
    examTime: '11:00 – 13:00',
    group: 'BBIT 2.2C Aug - Dec 26',
    venue: 'BLUESKY',
    lecturer: 'N. Wanyoike',
  },
  {
    code: 'BBT 3101',
    name: 'Application Programming for the Internet',
    examDate: '2026-12-08',
    examTime: '11:00 – 13:00',
    group: 'BBIT 2.2C Aug - Dec 26',
    venue: 'FORGE GF-01',
    lecturer: 'E. Simiyu',
  },
  {
    code: 'HED 1202',
    name: 'Communication Skills II',
    examDate: '2026-12-08',
    examTime: '13:30 – 15:30',
    group: 'Aug 26 BBIT A / B (confirm group on exam card)',
    venue: 'AUDITORIUM (Grp A) / FORGE F2-01 (Grp B)',
    lecturer: 'K. Omolo / F. Waga',
  },
  {
    code: 'HED 2101',
    name: 'Principles of Ethics',
    examDate: '2026-12-09',
    examTime: '16:00 – 18:00',
    group: 'Aug 26 BBIT C',
    venue: 'FORGE F2-01',
    lecturer: 'C. Maingi',
  },
  {
    code: 'HLE 2201',
    name: 'French II',
    examDate: '2026-12-11',
    examTime: '13:30 – 15:30',
    group: 'Aug 26 SCES C',
    venue: 'FORGE F1-03',
    lecturer: 'R. Arina',
  },
  {
    code: 'BBT 2103',
    name: 'Software Engineering',
    examDate: '2026-12-14',
    examTime: '13:30 – 15:30',
    group: 'BBIT 2.2C Aug - Dec 26',
    venue: 'FORGE GF-01',
    lecturer: 'P. Shabaya',
  },
  {
    code: 'BBT 2206',
    name: 'Probability and Statistics I',
    examDate: '2026-12-15',
    examTime: '16:00 – 18:00',
    group: 'BBIT 2.2C Aug - Dec 26',
    venue: 'FORGE F2-01',
    lecturer: 'A. Muia',
  },
];

export const strathmorePastPapersUrl = 'https://su-plus.strathmore.edu/communities/4979d744-9a9d-4a02-8b82-75a472cc6287';
