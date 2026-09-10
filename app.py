
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types
import joblib
import pandas as pd


app = FastAPI()


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# LOAD ML MODEL
# ==========================================

model = joblib.load("rf_model.pkl")
scaler = joblib.load("scaler.pkl")


# ==========================================
# STUDENT DATA MODEL
# ==========================================

class Student(BaseModel):
    Age: int
    Gender: str
    CGPA: float
    Internships: int
    Projects: int
    Coding_Skills: float
    Communication_Skills: float
    Aptitude_Test_Score: float
    Soft_Skills_Rating: float
    Certifications: int
    Backlogs: int
    Branch: str
    Degree: str


# ==========================================
# AI RESPONSE MODEL
# ==========================================

class AIAnalysis(BaseModel):
    summary: str
    strengths: list[str]
    improvements: list[str]
    actions: list[str]


# ==========================================
# PLACEMENT PREDICTION
# ==========================================

@app.post("/predict")
def predict(student: Student):

    # Encode Gender
    gender = 1 if student.Gender == "Male" else 0

    # Encode Branch
    branch_civil = 1 if student.Branch == "Civil" else 0
    branch_ece = 1 if student.Branch == "ECE" else 0
    branch_it = 1 if student.Branch == "IT" else 0
    branch_me = 1 if student.Branch == "ME" else 0

    # Encode Degree
    degree_btech = 1 if student.Degree == "B.Tech" else 0
    degree_bca = 1 if student.Degree == "BCA" else 0
    degree_mca = 1 if student.Degree == "MCA" else 0

    # Create feature dataframe
    student_data = pd.DataFrame([{
        "Age": student.Age,
        "Gender": gender,
        "CGPA": student.CGPA,
        "Internships": student.Internships,
        "Projects": student.Projects,
        "Coding_Skills": student.Coding_Skills,
        "Communication_Skills": student.Communication_Skills,
        "Aptitude_Test_Score": student.Aptitude_Test_Score,
        "Soft_Skills_Rating": student.Soft_Skills_Rating,
        "Certifications": student.Certifications,
        "Backlogs": student.Backlogs,
        "Branch_Civil": branch_civil,
        "Branch_ECE": branch_ece,
        "Branch_IT": branch_it,
        "Branch_ME": branch_me,
        "Degree_B.Tech": degree_btech,
        "Degree_BCA": degree_bca,
        "Degree_MCA": degree_mca
    }])

    # Scale features
    scaled_data = scaler.transform(student_data)

    # Generate prediction
    prediction = model.predict(scaled_data)
    probability = model.predict_proba(scaled_data)

    return {
        "prediction": "Placed" if prediction[0] == 1 else "Not Placed",
        "probability": float(probability[0][1])
    }


# ==========================================
# SKILL RECOMMENDER
# ==========================================

def get_skill_recommendations(student: Student):

    recommendations = []

    if student.CGPA < 7:
        recommendations.append(
            "Focus on improving your CGPA — aim for consistent performance above 7.0"
        )

    if student.Coding_Skills < 7:
        recommendations.append(
            "Practice coding daily on platforms like LeetCode or HackerRank"
        )

    if student.Communication_Skills < 7:
        recommendations.append(
            "Join a public speaking or communication skills workshop"
        )

    if student.Aptitude_Test_Score < 70:
        recommendations.append(
            "Practice aptitude tests — quantitative, logical, and verbal reasoning"
        )

    if student.Soft_Skills_Rating < 7:
        recommendations.append(
            "Work on teamwork and soft skills through group projects or clubs"
        )

    if student.Internships < 1:
        recommendations.append(
            "Apply for at least one internship to gain practical experience"
        )

    if student.Projects < 2:
        recommendations.append(
            "Build 2-3 solid projects to showcase on your resume"
        )

    if student.Certifications < 1:
        recommendations.append(
            "Earn a relevant online certification (Coursera, Udemy, etc.)"
        )

    if student.Backlogs > 0:
        recommendations.append(
            "Clear pending backlogs as a priority — they impact placement eligibility"
        )

    if len(recommendations) == 0:
        recommendations.append(
            "Your profile looks strong across all areas — keep it up!"
        )

    return recommendations


@app.post("/recommend-skills")
def recommend_skills(student: Student):

    recommendations = get_skill_recommendations(student)

    return {
        "recommendations": recommendations
    }


# ==========================================
# GEMINI AI CAREER ANALYSIS
# ==========================================

@app.post("/ai-analysis")
def ai_analysis(student: Student):

    client = genai.Client()

    prompt = f"""
You are a career guidance assistant for a college placement prediction platform.

Analyze the following student's profile and provide concise, personalized career guidance.

Student profile:
- Age: {student.Age}
- CGPA: {student.CGPA}
- Internships: {student.Internships}
- Projects: {student.Projects}
- Coding Skills: {student.Coding_Skills}/10
- Communication Skills: {student.Communication_Skills}/10
- Aptitude Test Score: {student.Aptitude_Test_Score}/100
- Soft Skills Rating: {student.Soft_Skills_Rating}/10
- Certifications: {student.Certifications}
- Backlogs: {student.Backlogs}
- Branch: {student.Branch}
- Degree: {student.Degree}

Return:
- One overall summary of 2-3 sentences.
- Exactly 4 strengths.
- Exactly 3 areas to improve.
- Exactly 3 practical next actions.

IMPORTANT CONTENT RULES:

1. Each strength must cover a DIFFERENT category:
   - Academic performance
   - Technical or analytical ability
   - Communication or soft skills
   - Practical exposure

2. Each improvement must address a DIFFERENT issue.
   Do not describe coding, certifications, or soft skills more than once.

3. Each action must correspond to a DIFFERENT improvement.
   Do not repeat the same recommendation using different wording.

4. Do not repeat the same student attribute in multiple points.
   For example, do not mention the CGPA in two different strengths.

5. Do not simply restate the student's numerical values.
   Use the values only when they add useful context.

6. Do not invent achievements, experience, skills, qualifications, project
   subjects, project types, internship types, or career goals.

7. Do not describe projects or internships as technical unless that was
   explicitly provided.

8. Do not assume that the student's branch determines their career.
   A non-CS student may target software, IT, data, analytics, automation,
   consulting, core engineering, or other technology roles.

9. Suggestions must be relevant to the student's actual profile and should
   support realistic placement preparation.

10. Every point must provide a distinct insight.
    Do not generate semantically duplicate statements.

11. Do not include stray words, unfinished phrases, headings, numbering,
    or unrelated text inside individual list items.

12. Every list item must be one concise, complete sentence.
"""

    # ==========================================
    # GEMINI MODEL FALLBACK
    # ==========================================

    models_to_try = [
        "gemini-3.6-flash",
        "gemini-3.5-flash-lite"
    ]

    response = None
    last_error = None

    for model_name in models_to_try:

        try:

            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=AIAnalysis
                )
            )

            print(
                f"Gemini model {model_name} succeeded."
            )

            break

        except Exception as error:

            last_error = error

            print(
                f"Gemini model {model_name} failed: {error}"
            )


    # If every model failed, return the last error
    if response is None:
        raise last_error


    # ==========================================
    # PARSE STRUCTURED AI RESPONSE
    # ==========================================

    result = AIAnalysis.model_validate_json(
        response.text
    )

    return result.model_dump()
