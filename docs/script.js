
const form = document.getElementById('predictForm');
const resultBox = document.getElementById('result');
const probabilityValue = document.getElementById('probabilityValue');

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const branch = document.getElementById('branch').value;
  const degree = document.getElementById('degree').value;
  const gender = document.getElementById('gender').value;

  // Send the original values to the backend.
  // FastAPI will handle the encoding for the ML model.
  const studentData = {
    Age: parseInt(document.getElementById('age').value),

    Gender: gender,

    CGPA: parseFloat(document.getElementById('cgpa').value),
    Internships: parseInt(document.getElementById('internships').value),
    Projects: parseInt(document.getElementById('projects').value),

    Coding_Skills: parseFloat(
      document.getElementById('codingSkills').value
    ),

    Communication_Skills: parseFloat(
      document.getElementById('communicationSkills').value
    ),

    Aptitude_Test_Score: parseFloat(
      document.getElementById('aptitude').value
    ),

    Soft_Skills_Rating: parseFloat(
      document.getElementById('softSkills').value
    ),

    Certifications: parseInt(
      document.getElementById('certifications').value
    ),

    Backlogs: parseInt(
      document.getElementById('backlogs').value
    ),

    Branch: branch,

    Degree: degree
  };

  console.log('Student data being sent:', studentData);

  try {

    // ==============================
    // PREDICT PLACEMENT
    // ==============================

    const response = await fetch(
      'https://placement-prediction-c69p.onrender.com/predict',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(studentData)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        'Prediction server returned:',
        response.status,
        errorText
      );

      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();

    console.log('Prediction response:', data);


    // ==============================
    // DISPLAY PROBABILITY
    // ==============================

    // Backend returns probability like:
    // 0.04 = 4%
    const probabilityPercent =
      (data.probability * 100).toFixed(1);

    probabilityValue.textContent =
      probabilityPercent + '%';

    resultBox.classList.remove('hidden');


    // ==============================
    // GET SKILL RECOMMENDATIONS
    // ==============================

    const recommendations =
      await getSkillRecommendations(studentData);

    const skillList =
      document.getElementById('skillList');

    skillList.innerHTML = '';

    if (recommendations.length === 0) {

      const li = document.createElement('li');

      li.textContent =
        'No recommendations available right now.';

      skillList.appendChild(li);

    } else {

      recommendations.forEach(function (tip) {

        const li = document.createElement('li');

        li.textContent = tip;

        skillList.appendChild(li);

      });
    }

    document
      .getElementById('skillBox')
      .classList.remove('hidden');


  } catch (error) {

    console.error(
      'Prediction failed:',
      error
    );

    alert(
      'Something went wrong. Check the console for details.'
    );
  }
});


// ==========================================
// SKILL RECOMMENDATION
// ==========================================

async function getSkillRecommendations(studentData) {

  try {

    const response = await fetch(
      'https://placement-prediction-y29i.onrender.com/recommend-skills',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(studentData)
      }
    );


    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        'Skill recommendation server returned:',
        response.status
      );

      console.error(
        'Server response:',
        errorText
      );

      return [];
    }


    const data =
      await response.json();

    console.log(
      'Skill recommendation response:',
      data
    );


    return data.recommendations || [];


  } catch (error) {

    console.error(
      'Skill recommendation failed:',
      error
    );

    return [];
  }
}

