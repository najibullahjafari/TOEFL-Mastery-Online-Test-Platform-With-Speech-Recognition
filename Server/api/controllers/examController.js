const Exam = require("../models/exam");
const Test = require("../models/test");

// Retrieve all exams from the database.
exports.findExam = async (req, res) => {
  try {
    const exams = await Exam.find();
    res.json(exams);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// Retrieve all exams from the database.
exports.findTests = async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// Retrieve JSON test data for practice tests
exports.findJsonTests = async (req, res) => {
  const MongoClient = require('mongodb').MongoClient;
  const url = process.env.DB_URL || "mongodb://localhost:27017/";

  try {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      const dbo = db.db("toefl_mastery");

      // Get exams from Exams collection
      dbo.collection("Exams").find({}).toArray(function (err, exams) {
        if (err) throw err;

        // Transform exams to match PracticeTestDashBoard format
        const transformedExams = exams.map(exam => ({
          _id: exam.exam_id,
          id: exam.exam_id,
          date: exam.exam_date,
          title: exam.exam_title,
          type: "General",
          description: "TOEFL Practice Test with Reading, Listening, Writing, and Speaking sections",
          exam_title: exam.exam_title,
          exam_id: exam.exam_id,
          test_id: exam.test_id,
          completed: true, // JSON tests have all sections
          // Add section arrays for ExamCard
          reading: [{ section: 1 }],
          listening: [{ section: 1 }],
          writing: [{ section: 1 }],
          speaking: [{ section: 1 }]
        }));

        res.json(transformedExams);
        db.close();
      });
    });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

exports.findTestsById = async (req, res) => {
  const id = req.params.id;

  console.log("In here by Id" + id);

  const MongoClient = require('mongodb').MongoClient;
  const url = process.env.DB_URL || "mongodb://localhost:27017/";

  try {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      const dbo = db.db("toefl_mastery");

      // Get test structure from Tests collection
      dbo.collection("Tests").findOne({}, function (err, testData) {
        if (err) {
          console.log("Error fetching Tests:", err);
          throw err;
        }

        console.log("Test data keys:", testData ? Object.keys(testData) : "No data");
        console.log("Looking for test ID:", id);

        // Get question sets from QuestionSet collection
        dbo.collection("QuestionSet").findOne({}, function (err, questionSets) {
          if (err) {
            console.log("Error fetching QuestionSet:", err);
            throw err;
          }

          console.log("QuestionSet keys:", questionSets ? Object.keys(questionSets) : "No data");

          if (!testData || !testData[id]) {
            console.log("Test not found for ID:", id);
            res.status(404).send({ message: "Not found Test with ID " + id });
            db.close();
            return;
          }

          const testStructure = testData[id][0];
          console.log("Test structure:", testStructure);

          const sections = [];

          // Transform sections to match QuestionView format using for loop
          for (let index = 0; index < testStructure.test_section.length; index++) {
            try {
              const section = testStructure.test_section[index];
              const questionSet = questionSets[section.question_set];
              console.log(`Section ${index}:`, section, "QuestionSet:", questionSet ? "Found" : "Not found");
              console.log(`QuestionSet type:`, Array.isArray(questionSet) ? "Array" : typeof questionSet);
              console.log(`QuestionSet length:`, Array.isArray(questionSet) ? questionSet.length : "N/A");

              // Transform questions to match QuestionView format
              const transformedQuestions = Array.isArray(questionSet) ? questionSet.map((q, qIndex) => ({
                _id: `${id}_${index}_${qIndex}`,
                title: q.question,
                description: "",
                options: q.options || [],
                type: "multiple-choice",
                answer: q.correct_answer,
                marks: 1
              })) : [];

              console.log(`Transformed ${transformedQuestions.length} questions for section ${index}`);

              sections.push({
                _id: `${id}_${index}`,
                examId: id,
                section: index + 1,
                category: section['section_id '] ? section['section_id '].trim() : "Unknown",
                source: "Reading passage",
                instruction: "Read the passage and answer the questions",
                questions: transformedQuestions
              });
            } catch (error) {
              console.log(`Error processing section ${index}:`, error);
            }
          }

          console.log("Returning sections:", sections.length);
          console.log("Sections data:", JSON.stringify(sections, null, 2));
          res.send(sections);
          db.close();
        });
      });
    });
  } catch (error) {
    console.log("Error in findTestsById:", error);
    res.status(500).send({ message: "Error retrieving Test with ID=" + id });
  }
};
