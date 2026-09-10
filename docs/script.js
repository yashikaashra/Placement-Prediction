
const form = document.getElementById('predictForm');
const resultBox = document.getElementById('result');
const probabilityValue = document.getElementById('probabilityValue');
const predictionStatus = document.getElementById('predictionStatus');

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const branch = document.getElementById('branch').value;
  const degree = document.getElementById('degree').value;
  const gender = document.getElementById('gender').value;

  // ==========================================
  // COLLECT STUDENT DATA
  // ==========================================

  const studentData = {
    Age: parseInt(document.getElementById('age').value),

    Gender: gender,

    CGPA: parseFloat(
      document.getElementById('cgpa').value
    ),

    Internships: parseInt(
      document.getElementById('internships').value
    ),

    Projects: parseInt(
      document.getElementById('projects').value
    ),

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

  console.log(
    'Student data being sent:',
    studentData
  );

  try {

    // ==========================================
    // 1. PREDICT PLACEMENT
    // ==========================================

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

      const errorText =
        await response.text();

      console.error(
        'Prediction server returned:',
        response.status,
        errorText
      );

      throw new Error(
        `Server returned ${response.status}`
      );
    }

    const data = await response.json();

    console.log(
      'Prediction response:',
      data
    );


    // ==========================================
    // 2. DISPLAY PLACEMENT PREDICTION
    // ==========================================

    const probabilityPercent =
      (data.probability * 100).toFixed(1);

    probabilityValue.textContent =
      probabilityPercent + '%';

    predictionStatus.textContent =
      data.prediction;

    resultBox.classList.remove('hidden');


    // ==========================================
    // 3. RULE-BASED PROFILE ANALYSIS
    // ==========================================

    analyzeProfile(studentData);


    // ==========================================
    // 4. DAY 4 SKILL RECOMMENDATIONS
    // ==========================================

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


    // ==========================================
    // 5. GEMINI AI CAREER ANALYSIS
    // ==========================================

    await getAIAnalysis(studentData);

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
// PROFILE ANALYSIS
// ==========================================

function analyzeProfile(studentData) {

  const strengthList =
    document.getElementById('strengthList');

  const improvementList =
    document.getElementById('improvementList');

  strengthList.innerHTML = '';
  improvementList.innerHTML = '';

  const strengths = [];
  const improvements = [];


  // CGPA
  if (studentData.CGPA >= 8) {

    strengths.push(
      'Strong academic performance with a good CGPA'
    );

  } else if (studentData.CGPA < 7) {

    improvements.push(
      'Improve your CGPA and maintain consistent academic performance'
    );
  }


  // Internships
  if (studentData.Internships >= 1) {

    strengths.push(
      'You have internship experience'
    );

  } else {

    improvements.push(
      'Gain internship experience to build practical exposure'
    );
  }


  // Projects
  if (studentData.Projects >= 2) {

    strengths.push(
      'Good project experience to showcase on your resume'
    );

  } else {

    improvements.push(
      'Build more projects to demonstrate practical skills'
    );
  }


  // Coding Skills
  if (studentData.Coding_Skills >= 7) {

    strengths.push(
      'Good coding skills'
    );

  } else {

    improvements.push(
      'Strengthen your coding and problem-solving skills'
    );
  }


  // Communication
  if (studentData.Communication_Skills >= 7) {

    strengths.push(
      'Good communication skills'
    );

  } else {

    improvements.push(
      'Work on communication and interview skills'
    );
  }


  // Aptitude
  if (studentData.Aptitude_Test_Score >= 70) {

    strengths.push(
      'Good aptitude test performance'
    );

  } else {

    improvements.push(
      'Practice quantitative, logical, and verbal aptitude'
    );
  }


  // Soft Skills
  if (studentData.Soft_Skills_Rating >= 7) {

    strengths.push(
      'Strong soft skills'
    );

  } else {

    improvements.push(
      'Develop teamwork, leadership, and other soft skills'
    );
  }


  // Certifications
  if (studentData.Certifications >= 1) {

    strengths.push(
      'You have relevant certification experience'
    );

  } else {

    improvements.push(
      'Consider earning a relevant certification'
    );
  }


  // Backlogs
  if (studentData.Backlogs === 0) {

    strengths.push(
      'No current backlogs'
    );

  } else {

    improvements.push(
      'Clear pending backlogs as a priority'
    );
  }


  // ==========================================
  // DISPLAY STRENGTHS
  // ==========================================

  if (strengths.length === 0) {

    const li = document.createElement('li');

    li.textContent =
      'No major strengths identified yet.';

    strengthList.appendChild(li);

  } else {

    strengths.forEach(function (strength) {

      const li = document.createElement('li');

      li.textContent = strength;

      strengthList.appendChild(li);

    });
  }


  // ==========================================
  // DISPLAY IMPROVEMENTS
  // ==========================================

  if (improvements.length === 0) {

    const li = document.createElement('li');

    li.textContent =
      'Your profile looks strong across the evaluated areas.';

    improvementList.appendChild(li);

  } else {

    improvements.forEach(function (improvement) {

      const li = document.createElement('li');

      li.textContent = improvement;

      improvementList.appendChild(li);

    });
  }
}


// ==========================================
// DAY 4 SKILL RECOMMENDATION
// ==========================================

async function getSkillRecommendations(studentData) {

  try {

    const response = await fetch(
      'https://placement-prediction-c69p.onrender.com/recommend-skills',
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


// ==========================================
// GEMINI AI ANALYSIS
// ==========================================

async function getAIAnalysis(studentData) {

  const aiBox =
    document.getElementById('aiBox');

  const aiSummary =
    document.getElementById('aiSummary');

  const aiStrengthList =
    document.getElementById('aiStrengthList');

  const aiImprovementList =
    document.getElementById('aiImprovementList');

  const aiActionList =
    document.getElementById('aiActionList');


  // Clear previous AI result
  aiSummary.textContent = '';

  aiStrengthList.innerHTML = '';
  aiImprovementList.innerHTML = '';
  aiActionList.innerHTML = '';

  try {

    const response = await fetch(
      'https://placement-prediction-c69p.onrender.com/ai-analysis',
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
        'AI analysis server returned:',
        response.status
      );

      console.error(
        'AI server response:',
        errorText
      );

      aiSummary.textContent =
        'AI career analysis is currently unavailable.';

      aiBox.classList.remove('hidden');

      return;
    }


    const data =
      await response.json();

    console.log(
      'AI analysis response:',
      data
    );


    // ==========================================
    // DISPLAY SUMMARY
    // ==========================================

    aiSummary.textContent =
      data.summary || 'No AI summary available.';


    // ==========================================
    // DISPLAY AI STRENGTHS
    // ==========================================

    if (
      Array.isArray(data.strengths) &&
      data.strengths.length > 0
    ) {

      data.strengths.forEach(function (strength) {

        const li =
          document.createElement('li');

        li.textContent = strength;

        aiStrengthList.appendChild(li);

      });

    } else {

      const li =
        document.createElement('li');

      li.textContent =
        'No AI strengths available.';

      aiStrengthList.appendChild(li);
    }


    // ==========================================
    // DISPLAY AI IMPROVEMENTS
    // ==========================================

    if (
      Array.isArray(data.improvements) &&
      data.improvements.length > 0
    ) {

      data.improvements.forEach(function (improvement) {

        const li =
          document.createElement('li');

        li.textContent = improvement;

        aiImprovementList.appendChild(li);

      });

    } else {

      const li =
        document.createElement('li');

      li.textContent =
        'No AI improvements available.';

      aiImprovementList.appendChild(li);
    }


    // ==========================================
    // DISPLAY AI ACTIONS
    // ==========================================

    if (
      Array.isArray(data.actions) &&
      data.actions.length > 0
    ) {

      data.actions.forEach(function (action) {

        const li =
          document.createElement('li');

        li.textContent = action;

        aiActionList.appendChild(li);

      });

    } else {

      const li =
        document.createElement('li');

      li.textContent =
        'No AI actions available.';

      aiActionList.appendChild(li);
    }


    // Show AI section
    aiBox.classList.remove('hidden');


  } catch (error) {

    console.error(
      'AI analysis failed:',
      error
    );

    aiSummary.textContent =
      'AI career analysis is currently unavailable.';

    aiBox.classList.remove('hidden');
  }
}

