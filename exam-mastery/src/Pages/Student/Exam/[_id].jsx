import QuestionsView from "../../../Components/TestComponents/QuestionView/QuestionView";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { Fab } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { useTheme } from "@mui/material/styles";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { Route, Link, Routes, useParams } from "react-router-dom";
import { useRoute } from "@react-navigation/native";
import { API_BASE_URL } from "../../../config/api";

export default function Exam() {
  const handle = useFullScreenHandle();
  const theme = useTheme();
  // const router = useRoute();
  const params = useParams();
  const { id } = params.id;
  const [exams, setExams] = useState([]);

  async function getTestsByExam() {
    try {
      const response1 = await fetch(
        `${API_BASE_URL}/exam-mastery/exams/${params.id}/tests`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "*",
          },
        },
      );
      const tests = await response1.json();
      console.log("tests", tests);
      console.log(
        "Test categories:",
        tests.map((t) => t.category),
      );
      return tests;
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!params.id) {
      return;
    } else {
      getTestsByExam()
        .then((res) => {
          //test order - Listening, Reading, Writing, Speaking
          let flattenExam = [];
          flattenExam.push(
            res
              .filter((item) => item.category === "listening")
              .sort((a, b) => a.section - b.section),
          );
          flattenExam.push(
            res
              .filter((item) => item.category === "reading")
              .sort((a, b) => a.section - b.section),
          );
          flattenExam.push(
            res
              .filter((item) => item.category === "writing")
              .sort((a, b) => a.section - b.section),
          );
          flattenExam.push(
            res
              .filter((item) => item.category === "speaking")
              .sort((a, b) => a.section - b.section),
          );
          console.log(flattenExam.flat());
          setExams(flattenExam.flat());
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [id]);

  return (
    <>
      <FullScreen handle={handle}>
        <Box
          sx={{
            background: theme.palette.mode === "dark" ? "" : "white",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <QuestionsView exams={exams}></QuestionsView>
        </Box>
      </FullScreen>
      <Fab
        color="primary"
        aria-label="add"
        onClick={handle.enter}
        sx={{
          position: "fixed",
          bottom: 26,
          right: 26,
        }}
      >
        <FullscreenIcon />
      </Fab>
    </>
  );

  //Create a test ID while starting test
  //After submitting: score ID
}
