require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const app = express();

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.SECRET_ID,
    process.env.REDIRECT_URI
);

const calendar = google.calendar({ version: 'v3' });

// Configure your schedule here
const TIME_ZONE = 'Asia/Kolkata'; // Timezone for Navi Mumbai
const START_DATE = '2023-02-02'; // First Monday of your schedule (YYYY-MM-DD)
const END_UNTIL = '20250606T235959Z'; // June 6, 2025 23:59:59 IST converted to UTC

const weeklySchedule = {
    Monday: [
        { start: '09:10', end: '10:00', name: 'THEORY OF AUTOMATA & COMPUTATION', description: 'Dr Deepa Parasar[304206] (218)' },
        { start: '10:10', end: '11:00', name: 'FRENCH-IV', description: 'Ms Divya Modi[309533] (218)' },
        { start: '11:10', end: '12:00', name: 'OPERATING SYSTEMS', description: 'Dr Saranya A[312548] (218)' },
        { start: '12:10', end: '13:00', name: 'COMPUTER GRAPHICS', description: 'Dr Deepika Shekhawat[312999] (218)' },
        { start: '14:00', end: '14:50', name: 'MICROPROCESSOR & MICROCONTROLLER', description: 'Dr Garima Shukla[312015] (218)' },
        { start: '15:00', end: '15:50', name: 'DISCRETE MATHEMATICS', description: 'Dr Pameli Saha[313835] (218)' }
    ],
    Tuesday: [
        { start: '09:10', end: '10:00', name: 'THEORY OF AUTOMATA & COMPUTATION', description: 'Dr Deepa Parasar[304206] (218)' },
        { start: '10:10', end: '11:00', name: 'FRENCH-IV', description: 'Ms Divya Modi[309533] (218)' },
        { start: '11:10', end: '12:00', name: 'COMPUTER GRAPHICS', description: 'Dr Deepika Shekhawat[312999] (218)' },
        { start: '12:10', end: '13:00', name: 'MICROPROCESSOR & MICROCONTROLLER', description: 'Dr Garima Shukla[312015] (218)' },
        { start: '14:00', end: '14:50', name: 'OPERATING SYSTEMS', description: 'Dr Saranya A[312548] (218)' }
    ],
    Wednesday: [
        { start: '09:10', end: '10:00', name: 'COMPUTER GRAPHICS LAB', description: 'Ms Saranya Pandian[314738] (218)' },
        { start: '10:10', end: '11:00', name: 'COMPUTER GRAPHICS LAB', description: 'Ms Saranya Pandian[314738] (218)' },
        { start: '11:10', end: '12:00', name: 'DISCRETE MATHEMATICS', description: 'Dr Pameli Saha[313835] (218)' },
        { start: '12:10', end: '13:00', name: 'EFFECTIVE WRITING SKILLS', description: 'Mrs Sheetal Hambarde[310224] (218)' },
        { start: '16:00', end: '16:50', name: 'INTRODUCTION TO MULTIMEDIA AND ITS APPLICATION', description: 'Mr Supratim Mukherjee[314489] (218)' }
    ],
    Thursday: [
        { start: '09:10', end: '10:00', name: 'MICROPROCESSOR & MICROCONTROLLER LAB', description: 'Dr Garima Shukla[312015] (Computer Lab 4)' },
        { start: '10:10', end: '11:00', name: 'MICROPROCESSOR & MICROCONTROLLER LAB', description: 'Dr Garima Shukla[312015] (Computer Lab 4)' },
        { start: '11:10', end: '12:00', name: 'OPERATING SYSTEMS', description: 'Dr Saranya A[312548] (218)' },
        { start: '12:10', end: '13:00', name: 'THEORY OF AUTOMATA & COMPUTATION', description: 'Dr Deepa Parasar[304206] (218)' },
        { start: '14:00', end: '14:50', name: 'OPERATING SYSTEMS LAB WITH UNIX', description: 'Dr Saranya A[312548] (COMPUTER LAB-II)' },
        { start: '15:00', end: '15:50', name: 'OPERATING SYSTEMS LAB WITH UNIX', description: 'Dr Saranya A[312548] (COMPUTER LAB-II)' },
        { start: '16:00', end: '16:50', name: 'INTRODUCTION TO MULTIMEDIA AND ITS APPLICATION', description: 'Mr Supratim Mukherjee[314489] (218)' }
    ],
    Friday: [
        { start: '10:10', end: '11:00', name: 'THEORY OF AUTOMATA & COMPUTATION', description: 'Dr Deepa Parasar[304206] (218)' },
        { start: '11:10', end: '12:00', name: 'COMPUTER GRAPHICS', description: 'Dr Deepika Shekhawat[312999] (218)' },
        { start: '12:10', end: '13:00', name: 'MICROPROCESSOR & MICROCONTROLLER', description: 'Dr Garima Shukla[312015] (218)' },
        { start: '14:00', end: '14:50', name: 'DISCRETE MATHEMATICS', description: 'Dr Pameli Saha[313835] (218)' },
        { start: '16:00', end: '16:50', name: 'INTRODUCTION TO MULTIMEDIA AND ITS APPLICATION', description: 'Mr Supratim Mukherjee[314489] (218)' }
    ]
};

app.get('/', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar.events']
    });
    res.redirect(url);
});

app.get('/redirect', async (req, res) => {
    try {
        const { code } = req.query;
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Create all events for each day
        for (const [day, courses] of Object.entries(weeklySchedule)) {
            for (const course of courses) {
                const event = {
                    summary: course.name,
                    description: course.description,
                    start: {
                        dateTime: `${START_DATE}T${course.start}:00`,
                        timeZone: TIME_ZONE
                    },
                    end: {
                        dateTime: `${START_DATE}T${course.end}:00`,
                        timeZone: TIME_ZONE
                    },
                    recurrence: [
                        `RRULE:FREQ=WEEKLY;BYDAY=${day.toUpperCase().substring(0, 2)};UNTIL=${END_UNTIL}`
                    ]
                };

                await calendar.events.insert({
                    auth: oauth2Client,
                    calendarId: 'primary',
                    requestBody: event
                });
            }
        }

        res.send('All weekly classes added successfully to your Google Calendar!');
    } catch (error) {
        res.send('Error: ' + error.message);
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});



// require('dotenv').config();
// const express = require('express');
// const { google } = require('googleapis');
// const moment = require('moment-timezone');  // Add moment-timezone for timezone manipulation
// const app = express();

// const oauth2Client = new google.auth.OAuth2(
//     process.env.CLIENT_ID,
//     process.env.SECRET_ID,
//     process.env.REDIRECT_URI
// );

// const calendar = google.calendar({ version: 'v3' });

// // Configure your schedule here
// const TIME_ZONE = 'Asia/Kolkata'; // Timezone for Navi Mumbai
// const START_DATE = '2023-02-02'; // First Monday of your schedule (YYYY-MM-DD)
// const END_UNTIL = '20250606T235959Z'; // June 6, 2025 23:59:59 IST converted to UTC

// const weeklySchedule = {
//     Monday: [
//         { start: '09:10', end: '10:00', name: 'THEORY OF AUTOMATA & COMPUTATION', description: 'Dr Deepa Parasar[304206] (218)' },
//         { start: '10:10', end: '11:00', name: 'FRENCH-IV', description: 'Ms Divya Modi[309533] (218)' },
//         { start: '11:10', end: '12:00', name: 'OPERATING SYSTEMS', description: 'Dr Saranya A[312548] (218)' },
//         { start: '12:10', end: '13:00', name: 'COMPUTER GRAPHICS', description: 'Dr Deepika Shekhawat[312999] (218)' },
//         { start: '14:00', end: '14:50', name: 'MICROPROCESSOR & MICROCONTROLLER', description: 'Dr Garima Shukla[312015] (218)' },
//         { start: '15:00', end: '15:50', name: 'DISCRETE MATHEMATICS', description: 'Dr Pameli Saha[313835] (218)' }
//     ],
//     // Other days...
// };

// app.get('/', (req, res) => {
//     const url = oauth2Client.generateAuthUrl({
//         access_type: 'offline',
//         scope: ['https://www.googleapis.com/auth/calendar.events']
//     });
//     res.redirect(url);
// });

// app.get('/redirect', async (req, res) => {
//     try {
//         const { code } = req.query;
//         const { tokens } = await oauth2Client.getToken(code);
//         oauth2Client.setCredentials(tokens);

//         // Create all events for each day
//         for (const [day, courses] of Object.entries(weeklySchedule)) {
//             for (const course of courses) {
//                 const startDateTime = moment.tz(`${START_DATE} ${course.start}`, TIME_ZONE).format();
//                 const endDateTime = moment.tz(`${START_DATE} ${course.end}`, TIME_ZONE).format();

//                 const event = {
//                     summary: course.name,
//                     description: course.description,
//                     start: {
//                         dateTime: startDateTime,
//                         timeZone: TIME_ZONE
//                     },
//                     end: {
//                         dateTime: endDateTime,
//                         timeZone: TIME_ZONE
//                     },
//                     recurrence: [
//                         `RRULE:FREQ=WEEKLY;BYDAY=${day.toUpperCase().substring(0, 2)};UNTIL=${END_UNTIL}`
//                     ]
//                 };

//                 await calendar.events.insert({
//                     auth: oauth2Client,
//                     calendarId: 'primary',
//                     requestBody: event
//                 });
//             }
//         }

//         res.send('All weekly classes added successfully to your Google Calendar!');
//     } catch (error) {
//         res.send('Error: ' + error.message);
//     }
// });

// app.listen(process.env.PORT, () => {
//     console.log(`Server running on http://localhost:${process.env.PORT}`);
// });

