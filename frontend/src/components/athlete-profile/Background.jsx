// Background.jsx
import React from "react";

const Background = ({ athlete }) => {
  const mockBackground = {
    achievements: "Regional U17 Champion, 2024",
    practiceFrequency: "5 days/week",
    workoutFrequency: "4 days/week",
    skillFrequency: "3 days/week",
    developmentLevel: "Advanced",
    nutrition: "High protein, moderate carbs",
    hydration: "2-3L daily",
    supplements: "Whey protein, Vitamin D",
    sleep: "7-8 hours/night",
    longTermGoals: "Play college-level soccer",
    sportGoals: "Improve lateral speed & endurance",
    athleteGoals: "Build stronger core, prevent knee pain",
    mentality: "Highly competitive, thrives under pressure",
    personality: "Calm, introverted but focused",
    prehab: "Preventive ankle work",
    testingRequests: "Quarterly speed/agility testing",
    supplementRequests: "Omega-3 trial for joint health",
    notes: "Prefers quiet environments to train",
    trainingStyle: "Explosive, power-driven movements",
    motivation: "Driven by future scholarship prospects",
    learningPref: "Visual + kinesthetic",
    communicationPref: "Text reminders and videos",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Athlete Background & Experience</h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-white p-4 border rounded shadow-sm">
          <h3 className="font-medium text-gray-700">Achievements</h3>
          <p>{mockBackground.achievements}</p>
        </div>
        <div className="bg-white p-4 border rounded shadow-sm">
          <h3 className="font-medium text-gray-700">Practice & Training</h3>
          <p>
            <strong>Practice:</strong> {mockBackground.practiceFrequency}
          </p>
          <p>
            <strong>Workout:</strong> {mockBackground.workoutFrequency}
          </p>
          <p>
            <strong>Skill:</strong> {mockBackground.skillFrequency}
          </p>
          <p>
            <strong>Level:</strong> {mockBackground.developmentLevel}
          </p>
        </div>
        <div className="bg-white p-4 border rounded shadow-sm">
          <h3 className="font-medium text-gray-700">Health & Habits</h3>
          <p>
            <strong>Nutrition:</strong> {mockBackground.nutrition}
          </p>
          <p>
            <strong>Hydration:</strong> {mockBackground.hydration}
          </p>
          <p>
            <strong>Supplements:</strong> {mockBackground.supplements}
          </p>
          <p>
            <strong>Sleep:</strong> {mockBackground.sleep}
          </p>
        </div>
        <div className="bg-white p-4 border rounded shadow-sm">
          <h3 className="font-medium text-gray-700">Training Objectives</h3>
          <p>
            <strong>Long Term:</strong> {mockBackground.longTermGoals}
          </p>
          <p>
            <strong>Sport Specific:</strong> {mockBackground.sportGoals}
          </p>
          <p>
            <strong>Individual:</strong> {mockBackground.athleteGoals}
          </p>
        </div>
        <div className="bg-white p-4 border rounded shadow-sm">
          <h3 className="font-medium text-gray-700">Coach’s Notes</h3>
          <p>
            <strong>Mentality:</strong> {mockBackground.mentality}
          </p>
          <p>
            <strong>Personality:</strong> {mockBackground.personality}
          </p>
          <p>
            <strong>Pre-hab:</strong> {mockBackground.prehab}
          </p>
          <p>
            <strong>Testing Requests:</strong> {mockBackground.testingRequests}
          </p>
          <p>
            <strong>Supplement Requests:</strong>{" "}
            {mockBackground.supplementRequests}
          </p>
          <p>
            <strong>Notes:</strong> {mockBackground.notes}
          </p>
        </div>
        <div className="bg-white p-4 border rounded shadow-sm">
          <h3 className="font-medium text-gray-700">Coach's IQ</h3>
          <p>
            <strong>Style:</strong> {mockBackground.trainingStyle}
          </p>
          <p>
            <strong>Motivation:</strong> {mockBackground.motivation}
          </p>
          <p>
            <strong>Learning:</strong> {mockBackground.learningPref}
          </p>
          <p>
            <strong>Communication:</strong> {mockBackground.communicationPref}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Background;
