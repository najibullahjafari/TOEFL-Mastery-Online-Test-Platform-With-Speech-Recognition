import React from "react";
import { Container, Grid, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import ExamCard from "../../Components/Student/PractiseTests/ExamCard";
import { API_BASE_URL } from "../../config/api";

//Displays the Different exams a student can take
const PracticeTestDashBoard = () => {
  const [data, setData] = useState();

  async function getExamGetTest() {
    try {
      //GET request to get JSON tests with questions
      const response1 = await fetch(`${API_BASE_URL}/exam-mastery/json-tests`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "*",
        },
      });
      const exams = await response1.json();
      return [exams, []];
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getExamGetTest().then((data) => {
      console.log("data", data);
      const exams = data[0].sort((a, b) => new Date(b.date) - new Date(a.date));
      // JSON tests already have completed flag set
      setData(exams);
    });
  }, []);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Select any of the test to get started!
      </Typography>
      <Grid container spacing={4}>
        {data?.map((exam, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            data-aos="fade-in"
            data-aos-delay={150 * index}
            key={exam._id}
          >
            <ExamCard exam={exam} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default PracticeTestDashBoard;
