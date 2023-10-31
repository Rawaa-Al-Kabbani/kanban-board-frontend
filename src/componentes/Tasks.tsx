import { gql, useMutation } from '@apollo/client'
import { useQuery } from '@apollo/react-hooks'
import { FunctionComponent, useEffect, useState } from 'react'
import Board from 'react-trello-ts'
import { BoardData, Card, Lane } from 'react-trello-ts/dist/types/Board'

export const Tasks: FunctionComponent = () => {
  const GET_TASKS = gql`
    query getTasksByGroup {
      tasks_by_status
    }
  `

  const ADD_TASK = gql`
    mutation addTask($title: String!, $status: TaskStatus!) {
      addTask(input: { title: $title, status: $status }) {
        id
        title
        status
      }
    }
  `

  const DELETE_TASK = gql`
    mutation deleteTask($id: Int!) {
      deleteTask(id: $id) {
        id
        title
        status
      }
    }
  `

  const UPDATE_TASK = gql`
    mutation updateTask($id: Int!, $title: String!, $status: String!) {
      updateTask(id: $id, data: { title: $title, status: $status }) {
        id
        title
        status
      }
    }
  `

  const UPDATE_TASK_STATUS = gql`
    mutation updateTaskStatus($id: Int!, $status: TaskStatus!) {
      updateTaskStatus(id: $id, status: $status) {
        id
        title
        status
      }
    }
  `

  const [addTask] = useMutation(ADD_TASK)
  const [updateTask] = useMutation(UPDATE_TASK)
  const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS)
  const [deleteTask] = useMutation(DELETE_TASK)
  const [boardData, setBoardData] = useState<BoardData>({ lanes: [] })

  const handleCardAdd = (card: Card, laneId: string) => {
    addTask({ variables: { title: card.title, status: laneId } })
  }

  const handleCardDelete = async (cardId: string) => {
    await deleteTask({ variables: { id: Number(cardId) } })
  }

  const handleCardUpdate = (cardId: string, data: Card) => {
    updateTask({ variables: { id: Number(cardId), title: data.title, status: data.laneId } })
  }

  const handleCardStatusUpdate = (cardId: string, laneId: string) => {
    updateTaskStatus({ variables: { id: Number(cardId), status: laneId } })
  }

  const handleOnCardMoveAcrossLanes = (fromLaneId: string, toLaneId: string, cardId: string, addedIndex: string) => {
    handleCardStatusUpdate(cardId, toLaneId)
  }

  const { loading, error, data } = useQuery(GET_TASKS)

  const getData = () => {
    if (loading) return <div>Fetching</div>
    if (error) return <div>Error</div>
    if (data?.tasks_by_status) {
      let lanes: Lane[] = []
      const objectKeys: string[] = Object.keys(data.tasks_by_status)
      objectKeys.forEach((key: string) => {
        const oldCards = data?.tasks_by_status[key]
        const newCards = oldCards.map((item: any) => {
          return {
            id: item.id.toString(),
            title: item.title
          }
        })
        lanes.push({ id: key, title: key, cards: [...newCards] })
        setBoardData({ lanes: lanes })
      })
    }
  }

  useEffect(() => {
    getData()
  }, [data])

  return (
    <Board
      data={boardData as BoardData}
      draggable
      laneDraggable
      editable
      onCardAdd={handleCardAdd}
      onCardDelete={handleCardDelete}
      onCardUpdate={handleCardUpdate}
      onCardMoveAcrossLanes={handleOnCardMoveAcrossLanes}
    />
  )
}
