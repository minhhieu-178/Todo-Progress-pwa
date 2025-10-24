import { createSlice } from '@reduxjs/toolkit'

// Định nghĩa state ban đầu
const initialState = {
  value: 0,
}

export const counterSlice = createSlice({
  name: 'counter', // Tên của slice
  initialState,   // State ban đầu
  // Các hàm (reducers) để thay đổi state
  reducers: {
    increment: (state) => {
      // RTK cho phép bạn "thay đổi trực tiếp" state (thực ra nó an toàn)
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
    // Ví dụ một hàm nhận giá trị
    incrementByAmount: (state, action) => {
      state.value += action.payload
    },
  },
})

// Export các action để component có thể gọi
export const { increment, decrement, incrementByAmount } = counterSlice.actions

// Export reducer để thêm vào store
export default counterSlice.reducer