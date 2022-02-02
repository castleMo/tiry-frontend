import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import styled, { useTheme } from 'styled-components';

import { THIRTY_MINUTES_TIME } from '../../constant';
import {
  GetMeOutput,
  GetReviewOutput,
  GetReviewsOutput,
  GetTodoOutput,
  GetTodosOutput,
} from '../../graphQL/types';
import { useWindowSize } from '../../hooks';
import { getDiaryCardHeight } from '../../utils';
import { DiaryCardDragLayer } from '../molecules';
import { DiaryCard, DiaryCreateCard, MainHeader } from '../organisms';
import { WeekCalendar } from '../organisms/calendar';

const StyledMainTemplate = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  background-color: ${({ theme }) => theme.colors.black2};
`;

const StyledBody = styled.div`
  width: 100%;
  height: auto;

  display: flex;
  flex: 1;
  flex-direction: column;

  overflow: hidden;
`;

const StyledDiaryContainer = styled.div<{ height?: number }>`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  flex: 1;

  position: relative;

  overflow-y: auto;
  overflow-x: hidden;
`;

const StyledTime = styled.div<{
  isNowHour: boolean;
  width: number;
  top: number;
}>`
  position: absolute;

  width: ${({ width }) => width}px;
  min-height: ${({ theme }) => theme.sizes.diaryCardHeight}px;

  display: flex;
  justify-content: center;
  align-items: center;

  color: ${({ theme, isNowHour }) =>
    isNowHour ? theme.colors.purple1 : theme.colors.grey1};
  font-family: Spoqa Han Sans Neo;
  font-size: 14px;

  border-right: 0.5px solid ${({ theme }) => theme.colors.grey3};

  top: ${({ top }) => top}px;
`;

const StyledDiaryTitleContainer = styled.div`
  display: flex;
  flex-direction: row;

  width: 100%;
  min-height: 66px;

  color: ${({ theme }) => theme.colors.purple1};
  font-size: 18;
`;

const StyledDiaryTitle = styled.div<{ isEmpty: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  min-width: 70px;
  width: ${({ isEmpty }) => (isEmpty ? null : '100%')};
  height: 100%;

  border: 0.5px solid ${({ theme }) => theme.colors.grey3};
  box-sizing: border-box;
`;

const StyledTimeUndecidedContainer = styled.div<{ width: number }>`
  position: fixed;

  width: ${({ width }) => width}px;
  min-height: 180px;

  background-color: ${({ theme }) => theme.colors.black2};

  z-index: 1;
`;

const StyledTimeUndecided = styled.div<{
  width: number;
  isTimeUndecidedTodos: boolean | undefined;
}>`
  min-width: ${({ width }) => width}px;
  min-height: ${({ isTimeUndecidedTodos }) =>
    isTimeUndecidedTodos ? 180 : 0}px;

  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 0.5px solid ${({ theme }) => theme.colors.grey3};
  color: ${({ theme }) => theme.colors.purple1};
`;

const StyledDiaryCreateCardContainer = styled.div<{
  width: number;
  left: number;
}>`
  width: ${({ width }) => width}px;
  height: ${({ theme }) => theme.sizes.diaryCardHeight}px;

  display: flex;
  flex-direction: row;

  /* left: ${({ left }) => left}px; */
`;

type PropTypes = {
  dataMe?: GetMeOutput;
  today: Date;
  dataTodos?: GetTodosOutput;
  dataReviews?: GetReviewsOutput;
  setToday: React.Dispatch<React.SetStateAction<Date>>;
};

export const MainTemplate: FC<PropTypes> = ({
  dataMe,
  today,
  dataTodos,
  dataReviews,
  setToday,
}): JSX.Element => {
  const theme = useTheme();
  const windowSize = useWindowSize();

  const nowHour = today.getHours();

  const todoTitleRef = useRef<HTMLDivElement>(null);
  const timeTitleRef = useRef<HTMLDivElement>(null);
  const diaryContainerRef = useRef<HTMLDivElement>(null);

  const [diaryContainerStartedY, setDiaryContainerStartedY] = useState(0);
  const [diaryCardWidth, setDiaryCardWidth] = useState(0);
  const [timeCardWidth, setTimeCardWidth] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const isTimeUndecidedTodos = useMemo(
    () =>
      (dataTodos?.timeUndecidedTodos &&
        dataTodos.timeUndecidedTodos.length > 0) ||
      (dataReviews?.timeUndecidedReviews &&
        dataReviews.timeUndecidedReviews.length > 0),
    [dataTodos, dataReviews],
  );

  const getNewStartedAt = (y: number) => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate();
    const todayZeroHourTimestamp = new Date(year, month, date).getTime();

    const calcCurrentY = Math.floor(y - (y % 10));
    const calcScrollTop = Math.floor(scrollTop - (scrollTop % 10));
    const calcDiaryContainerStartedY = Math.floor(
      diaryContainerStartedY - (diaryContainerStartedY % 10),
    );

    const calcY = calcCurrentY + calcScrollTop - calcDiaryContainerStartedY;

    const startTime =
      todayZeroHourTimestamp + Math.floor(calcY / 30) * THIRTY_MINUTES_TIME;
    const finishTime = 0;

    return startTime;
  };

  const [, todoDrop] = useDrop({
    accept: 'todo',
    drop(item: GetTodoOutput & { id?: number }, monitor: DropTargetMonitor) {
      console.log('====todo-drop====');
      const currentOffset = monitor.getSourceClientOffset() as {
        x: number;
        y: number;
      };

      const startedAt = getNewStartedAt(currentOffset.y);

      if (item.id) {
        console.log({ ...item });
      } else {
        console.log({ ...item });
      }

      console.log({
        start: new Date(startedAt),
        finish: new Date(0),
      });
    },
  });

  const [, reviewDrop] = useDrop({
    accept: 'review',
    drop(item: GetReviewOutput & { id?: number }, monitor: DropTargetMonitor) {
      console.log('====review-drop====');
      const currentOffset = monitor.getSourceClientOffset() as {
        x: number;
        y: number;
      };

      const startedAt = getNewStartedAt(currentOffset.y);

      if (item.id) {
        console.log({ ...item });
      } else {
        console.log({ ...item });
      }

      console.log({
        start: new Date(startedAt),
        finish: new Date(0),
      });
    },
  });

  useEffect(() => {
    if (timeTitleRef.current) {
      const timeRect = timeTitleRef.current.getBoundingClientRect();
      setTimeCardWidth(timeRect.width);
    }
  }, [timeTitleRef]);

  useEffect(() => {
    if (todoTitleRef.current) {
      const todoRect = todoTitleRef.current.getBoundingClientRect();
      setDiaryCardWidth(todoRect.width);
    }
  }, [todoTitleRef, windowSize]);

  useEffect(() => {
    if (diaryContainerRef.current) {
      todoDrop(diaryContainerRef);
      reviewDrop(diaryContainerRef);
      const diaryContainerRect =
        diaryContainerRef.current.getBoundingClientRect();
      setDiaryContainerStartedY(diaryContainerRect.top);
    }
  }, [diaryContainerRef]);

  return (
    <StyledMainTemplate>
      <MainHeader dataMe={dataMe} today={today} setToday={setToday} />
      <StyledBody>
        <WeekCalendar dataMe={dataMe} today={today} setToday={setToday} />
        <StyledDiaryTitleContainer>
          <StyledDiaryTitle isEmpty ref={timeTitleRef} />
          <StyledDiaryTitle isEmpty={false} ref={todoTitleRef}>
            오늘은 이렇게 보내고 싶어요
          </StyledDiaryTitle>
          <StyledDiaryTitle isEmpty={false}>
            오늘은 이렇게 보내고 싶어요
          </StyledDiaryTitle>
        </StyledDiaryTitleContainer>
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <StyledTimeUndecided
            width={timeCardWidth}
            isTimeUndecidedTodos={isTimeUndecidedTodos}
          >
            {isTimeUndecidedTodos ? '시간 미정' : ''}
          </StyledTimeUndecided>
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <DiaryCreateCard
              dragItemType="todo"
              inputPlaceHolder="예정된 할일을 입력해주세요."
            />
            {isTimeUndecidedTodos &&
              dataTodos?.timeUndecidedTodos.map((todo, i) => {
                const { startedAt, finishedAt } = todo;
                const height = getDiaryCardHeight(startedAt, finishedAt);

                return (
                  <DiaryCard
                    dragItemType="review"
                    item={todo}
                    height={height}
                    parentWidth={diaryCardWidth}
                    left={timeCardWidth}
                    key={todo.id}
                    styleType="timeLess"
                    originalIndex={i}
                    today={today}
                  />
                );
              })}
          </div>
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <DiaryCreateCard
              dragItemType="review"
              inputPlaceHolder="오늘 했던 일을 입력해주세요."
            />
            {isTimeUndecidedTodos &&
              dataReviews?.timeUndecidedReviews.map((review, i) => {
                const { startedAt, finishedAt } = review;
                const height = getDiaryCardHeight(startedAt, finishedAt);

                return (
                  <DiaryCard
                    dragItemType="review"
                    item={review}
                    height={height}
                    parentWidth={diaryCardWidth}
                    left={timeCardWidth + diaryCardWidth}
                    key={review.id}
                    styleType="timeLess"
                    originalIndex={i}
                    today={today}
                  />
                );
              })}
          </div>
        </div>
        <StyledDiaryContainer
          ref={diaryContainerRef}
          onScroll={(e: React.UIEvent<HTMLDivElement, UIEvent>) => {
            const currentScrollTop = e.currentTarget.scrollTop;
            setScrollTop(currentScrollTop);
          }}
        >
          <DiaryCardDragLayer parentWidth={diaryCardWidth} today={today} />
          {[...new Array(24).keys()].map((hour, i) => {
            const top = i * 60;

            return (
              <StyledTime
                width={timeCardWidth}
                key={hour}
                isNowHour={nowHour === hour}
                top={top}
              >
                {hour}시
              </StyledTime>
            );
          })}
          {dataTodos?.todos.map((todo, i) => {
            const { startedAt, finishedAt } = todo;
            const height = getDiaryCardHeight(startedAt, finishedAt);

            return (
              <DiaryCard
                dragItemType="todo"
                item={todo}
                height={height}
                parentWidth={diaryCardWidth}
                left={timeCardWidth}
                key={todo.id}
                styleType="none"
                originalIndex={i}
                today={today}
              />
            );
          })}
          {dataReviews?.reviews.map((review, i) => {
            const { startedAt, finishedAt } = review;
            const height = getDiaryCardHeight(startedAt, finishedAt);

            return (
              <DiaryCard
                dragItemType="review"
                item={review}
                height={height}
                parentWidth={diaryCardWidth}
                left={timeCardWidth + diaryCardWidth}
                key={review.id}
                styleType="none"
                originalIndex={i}
                today={today}
              />
            );
          })}
        </StyledDiaryContainer>
      </StyledBody>
    </StyledMainTemplate>
  );
};
