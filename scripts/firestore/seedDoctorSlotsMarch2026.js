import { db } from "../lib/firebaseAdmin.js";

const START_DATE = "2026-03-02";
const END_DATE = "2026-03-10";

const SLOT_TEMPLATE = {
  "9:00 AM": { capacity: 6, booked: 0 },
  "10:00 AM": { capacity: 6, booked: 0 },
  "11:00 AM": { capacity: 6, booked: 0 },
  "12:00 PM": { capacity: 6, booked: 0 },
  "2:00 PM": { capacity: 6, booked: 0 },
  "3:00 PM": { capacity: 6, booked: 0 },
  "4:00 PM": { capacity: 6, booked: 0 },
};

function buildDateRange(startDate, endDate) {
  const dates = [];
  const current = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

async function seedDoctorSlotsForMarch2026() {
  try {
    console.log(`🚀 Seeding doctor slots from ${START_DATE} to ${END_DATE}...`);

    const targetDates = buildDateRange(START_DATE, END_DATE);
    const servicesSnapshot = await db
      .collection("services")
      .where("category", "==", "Hospitals")
      .get();

    if (servicesSnapshot.empty) {
      console.log("⚠️ No hospital services found.");
      return;
    }

    let doctorCount = 0;
    let slotDocsUpdated = 0;

    for (const serviceDoc of servicesSnapshot.docs) {
      const serviceName = serviceDoc.id;
      const specificServicesSnapshot = await serviceDoc.ref
        .collection("specificServices")
        .get();

      if (specificServicesSnapshot.empty) {
        console.log(`ℹ️ No doctors/specific services found under ${serviceName}.`);
        continue;
      }

      for (const doctorDoc of specificServicesSnapshot.docs) {
        doctorCount += 1;
        const doctorData = doctorDoc.data();
        const existingDates = Array.isArray(doctorData.availableDates)
          ? doctorData.availableDates
          : [];

        const mergedDates = [...new Set([...existingDates, ...targetDates])].sort();

        await doctorDoc.ref.set({ availableDates: mergedDates }, { merge: true });

        for (const date of targetDates) {
          await doctorDoc.ref
            .collection("timeSlots")
            .doc(date)
            .set(SLOT_TEMPLATE, { merge: true });
          slotDocsUpdated += 1;
        }

        console.log(`✅ ${serviceName} -> ${doctorDoc.id}: ${targetDates.length} dates seeded`);
      }
    }

    console.log(
      `🎉 Done! Updated ${doctorCount} doctors and ${slotDocsUpdated} date-slot documents.`
    );
  } catch (error) {
    console.error("❌ Error seeding doctor slots:", error);
    process.exitCode = 1;
  }
}

seedDoctorSlotsForMarch2026();
