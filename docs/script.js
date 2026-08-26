const form = document.getElementById('predictForm');
const resultBox = document.getElementById('result');
const probabilityValue = document.getElementById('probabilityValue');

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const branch = document.getElementById('branch').value;
  const degree = document.getElementById('degree').value;
  const gender = document.getElementById('gender').value;

  const studentData = {
    Age: parseInt(document.getElementById('age').value),
    Gender: gender === 'Male' ? 1 : 0,

    CGPA: parseFloat(document.getElementById('cgpa').value),
    Internships: parseInt(document.getElementById('internships').value),
    Projects: parseInt(document.getElementById('projects').value),
    Coding_Skills: parseInt(document.getElementById('codingSkills').value),
    Communication_Skills: parseInt(document.getElementById('communicationSkills').value),
    Aptitude_Test_Score: parseInt(document.getElementById('aptitude').value),
    Soft_Skills_Rating: parseInt(document.getElementById('softSkills').value),
    Certifications: parseInt(document.getElementById('certifications').value),
    Backlogs: parseInt(document.getElementById('backlogs').value),

    Branch_Civil: branch === 'Civil' ? 1 : 0,
    Branch_ECE: branch === 'ECE' ? 1 : 0,
    Branch_IT: branch === 'IT' ? 1 : 0,
    Branch_ME: branch === 'ME' ? 1 : 0,

    Degree_BTech: degree === 'B.Tech' ? 1 : 0,
    Degree_BCA: degree === 'BCA' ? 1 : 0,
    Degree_MCA: degree === 'MCA' ? 1 : 0
  };

  try {
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
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();

    const probabilityPercent = data.placement_probability.toFixed(1);

    probabilityValue.textContent = probabilityPercent + '%';
    resultBox.classList.remove('hidden');

  } catch (error) {
    console.error('Prediction failed:', error);
    alert('Something went wrong. Check the console for details.');
  }
});