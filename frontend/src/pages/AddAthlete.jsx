import PageHeader from "../components/PageHeader";
import { Card, CardContent, CardHeader } from "../components/Card";
import AthleteForm from "../components/AthleteForm";

function AddAthlete() {
  const handleSubmit = async (data) => {
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      date_of_birth: data.birthday,
      gender: data.gender,
      city: data.city,
      level: data.level,
      sports: data.sport,
      position: data.position,
      club_team: data.clubTeam,
      email: data.email,
      mom_name: data.momName,
      dad_name: data.dadName,
      injuries: data.injuries,
      allergies: data.allergies,
      medications: data.medications,
      achievements: data.achievements,
      practice_frequency: data.practiceFrequency,
      workout_frequency: data.workoutFrequency,
      skill_frequency: data.skillFrequency,
      development_level: data.devLevel,
      nutritional_habits: data.nutrition,
      hydration_habits: data.hydration,
      supplements: data.supplements,
      sleeping_habits: data.sleep,
      long_term_goals: data.longGoals,
      sport_specific_goals: data.sportGoals,
      athlete_specific_goals: data.athleteGoals,
      athlete_mentality: data.mentality,
      athlete_personality: data.personality,
      prehab_needs: data.prehab,
      specified_testing_request: data.testingRequest,
      supplement_requests: data.supplementRequest,
      coach_notes: data.notes,
      training_style: data.trainingStyle,
      motivation_work_ethic: data.motivation,
      learning_preference: data.learning,
      communication_preference: data.communication,
      additional_comments: data.comments,
    };

    try {
      const response = await fetch("/api/athletes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await response.text());
      await response.json();
      alert("✅ Athlete added successfully!");
    } catch (error) {
      console.error("Error submitting athlete:", error);
      alert("❌ Failed to add athlete.");
    }
  };

  return (
    <>
      <PageHeader
        title="Add New Athlete"
        subtitle="Create an athlete profile. All fields follow the same design system."
      />

      <div className="max-w-4xl space-y-section">
        <Card>
          <CardHeader
            title="Basic Information"
            meta="Fill out the athlete details below"
          />
          <CardContent>
            <AthleteForm onSubmit={handleSubmit} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default AddAthlete;
