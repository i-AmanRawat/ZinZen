import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { PlusLg, Trash3Fill, PencilSquare, CheckLg, ChevronRight, ChevronDown } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";

import addIcon from "@assets/images/GoalsAddIcon.svg";
import {
  archiveGoal,
  getActiveGoals,
  removeGoal,
  isCollectionEmpty,
  removeChildrenGoals,
  archiveChildrenGoals,
} from "@api/GoalsAPI";
import { GoalItem } from "@src/models/GoalItem";
import { darkModeState } from "@src/store";
import { HeaderDashboard } from "@components/HeaderDashboard/HeaderDashboard";

import "./MyGoalsPage.scss";

export const MyGoalsPage = () => {
  const navigate = useNavigate();
  const [tapCount, setTapCount] = useState([-1, 0]);
  const [userGoals, setUserGoals] = useState<GoalItem[]>();
  const titleRef = useRef(null);
  const darkModeStatus = useRecoilValue(darkModeState);

  let debounceTimeout: ReturnType<typeof setTimeout>;

  // async function populateDummyGoals() {
  //   const goal1 = createGoal("Goal1", false, 2, null, null, 0);
  //   const goal2 = createGoal("Goal2", true, 1, null, null, 0);
  //   const goal3 = createGoal("Goal3", true, 2, null, null, 0);
  //   const dummyData = [goal1, goal2, goal3];
  //   dummyData.map((goal: string) => addGoal(goal));
  // }

  async function archiveUserGoal(goal: GoalItem) {
    await archiveChildrenGoals(Number(goal.id));
    await archiveGoal(Number(goal.id));
    const goals: GoalItem[] = await getActiveGoals();
    setUserGoals(goals);
  }
  async function removeUserGoal(id: number) {
    await removeChildrenGoals(id);
    await removeGoal(id);
    const goals: GoalItem[] = await getActiveGoals();
    setUserGoals(goals);
  }
  async function search(text: string) {
    const goals: GoalItem[] = await getActiveGoals();
    setUserGoals(goals.filter((goal) => goal.title.toUpperCase().includes(text.toUpperCase())));
  }
  function debounceSearch(event: ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    debounceTimeout = setTimeout(() => {
      search(value);
    }, 300);
  }

  useEffect(() => {
    async function checkCollection() {
      const result = await isCollectionEmpty();
      return result;
    }
    checkCollection().then((result) => {
      const timer1 = setTimeout(() => {
        if (result) {
          navigate("/Home/AddGoals", {
            state: { feelingDate: new Date() },
          });
        }
      }, 500);
      return () => {
        clearTimeout(timer1);
      };
    });
  }, [userGoals]);

  useEffect(() => {
    (async () => {
      // await populateDummyGoals();
      const goals: GoalItem[] = await getActiveGoals();
      setUserGoals(goals);
    })();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <HeaderDashboard />
      <div
        onClickCapture={() => setTapCount([-1, 0])}
        style={{
          marginTop: "100px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
        className="my-goals-content"
      >
        <input
          id={darkModeStatus ? "goal-searchBar-dark" : "goal-searchBar"}
          onClickCapture={() => setTapCount([-1, 0])}
          placeholder="Search"
          onChange={(e) => debounceSearch(e)}
        />
        <h1 id={darkModeStatus ? "myGoals_title-dark" : "myGoals_title"} onClickCapture={() => setTapCount([-1, 0])}>
          My Goals
        </h1>
        <div>
          {userGoals?.map((goal: GoalItem, index) => (
            <div
              aria-hidden
              key={String(`task-${index}`)}
              className="user-goal"
              onClick={() => navigate(`/Home/MyGoals/${goal.id}`)}
              style={{ backgroundColor: goal.goalColor, cursor: "pointer" }}
            >
              <div
                aria-hidden
                className="goal-title"
                ref={titleRef}
                suppressContentEditableWarning
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {goal.title}
                {tapCount[0] === index && tapCount[1] > 0 ? (
                  <ChevronDown fontSize="30px" />
                ) : (
                  <ChevronRight
                    fontSize="30px"
                    onClickCapture={(e) => {
                      e.stopPropagation();
                      setTapCount([index, tapCount[1] + 1]);
                    }}
                  />
                )}
              </div>
              {tapCount[0] === index && tapCount[1] > 0 ? (
                <div className="interactables">
                  <PlusLg
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/Home/AddGoals", { state: { goalId: goal.id } })}
                  />
                  <Trash3Fill
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      removeUserGoal(Number(goal.id));
                    }}
                  />
                  <PencilSquare
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/Home/AddGoals", { state: { editingGoal: true, goalId: goal.id } })}
                  />
                  <CheckLg
                    onClick={async () => {
                      archiveUserGoal(goal);
                      const updatedGoalsList = await getActiveGoals();
                      setUserGoals(updatedGoalsList);
                    }}
                    style={{ cursor: "Pointer" }}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <img
          onClick={() => {
            navigate("/Home/AddGoals");
          }}
          id="addGoal-btn"
          src={addIcon}
          alt="add-goal"
          aria-hidden
        />
      </div>
    </div>
  );
};
