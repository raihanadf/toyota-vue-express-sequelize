<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const users = ref([])
const loading = ref(true)
const error = ref(null)
const success = ref(null)

const newUser = ref({
  name: '',
  email: ''
})

const currentUser = ref(null)
const isEditing = ref(false)
const showDetails = ref(false)

const validateForm = (user = newUser.value) => {
  if (!user.name.trim()) {
    error.value = 'Name is required'
    return false
  }
  if (!user.email.trim()) {
    error.value = 'Email is required'
    return false
  }
  if (!/^\S+@\S+\.\S+$/.test(user.email)) {
    error.value = 'Please enter a valid email address'
    return false
  }
  return true
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await axios.get('http://localhost:3000/users')
    users.value = response.data
    error.value = null
  } catch (err) {
    error.value = 'Failed to fetch users: ' + (err.response?.data?.message || err.message)
    console.error('Error fetching users:', err)
  } finally {
    loading.value = false
  }
}

const createUser = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    const response = await axios.post('http://localhost:3000/users', newUser.value)
    users.value.push(response.data)
    success.value = 'User created successfully!'
    error.value = null

    newUser.value = { name: '', email: '' }
  } catch (err) {
    error.value = 'Failed to create user: ' +
      (err.response?.data?.message || err.message)
    console.error('Error creating user:', err)
  } finally {
    loading.value = false
    clearMessages()
  }
}

const viewUser = (user) => {
  currentUser.value = { ...user }
  isEditing.value = false
  showDetails.value = true
}

const editUser = (user) => {
  currentUser.value = { ...user }
  isEditing.value = true
  showDetails.value = true
}

const updateUser = async () => {
  if (!validateForm(currentUser.value)) return

  loading.value = true
  try {
    const response = await axios.put(`http://localhost:3000/users/${currentUser.value.id}`, {
      name: currentUser.value.name,
      email: currentUser.value.email
    })

    const index = users.value.findIndex(u => u.id === currentUser.value.id)
    if (index !== -1) {
      users.value[index] = { ...response.data }
    }

    success.value = 'User updated successfully!'
    error.value = null
    showDetails.value = false
  } catch (err) {
    error.value = 'Failed to update user: ' +
      (err.response?.data?.message || err.message)
    console.error('Error updating user:', err)
  } finally {
    loading.value = false
    clearMessages()
  }
}

const deleteUser = async (id) => {
  if (!confirm('Are you sure you want to delete this user?')) return

  loading.value = true
  try {
    await axios.delete(`http://localhost:3000/users/${id}`)
    users.value = users.value.filter(user => user.id !== id)
    success.value = 'User deleted successfully!'
    error.value = null
    showDetails.value = false
  } catch (err) {
    error.value = 'Failed to delete user: ' +
      (err.response?.data?.message || err.message)
    console.error('Error deleting user:', err)
  } finally {
    loading.value = false
    clearMessages()
  }
}

const closeDetails = () => {
  showDetails.value = false
  currentUser.value = null
  isEditing.value = false
}

const clearMessages = () => {
  setTimeout(() => {
    success.value = null
    error.value = null
  }, 3000)
}

onMounted(fetchUsers)
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-green-400 font-mono p-4">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-4 text-green-300">> USER_MANAGEMENT_CONSOLE</h1>

      <!-- Error message -->
      <div v-if="error" class="bg-red-900/50 border border-red-500 text-red-300 px-3 py-2 rounded mb-3 text-sm">
        ERROR: {{ error }}
      </div>

      <!-- Success message -->
      <div v-if="success" class="bg-green-900/50 border border-green-500 text-green-300 px-3 py-2 rounded mb-3 text-sm">
        SUCCESS: {{ success }}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Create User Form -->
        <div class="bg-gray-800 border border-gray-700 rounded p-4">
          <h2 class="text-lg font-semibold mb-3 text-green-300">> CREATE_USER</h2>
          <form @submit.prevent="createUser" class="space-y-3">
            <div>
              <label class="block text-gray-300 text-xs font-bold mb-1" for="name">
                NAME
              </label>
              <input v-model="newUser.name"
                class="bg-gray-900 border border-gray-600 text-green-400 rounded w-full py-2 px-3 text-sm font-mono focus:outline-none focus:border-green-500"
                id="name" type="text" placeholder="enter_name" required>
            </div>
            <div>
              <label class="block text-gray-300 text-xs font-bold mb-1" for="email">
                EMAIL
              </label>
              <input v-model="newUser.email"
                class="bg-gray-900 border border-gray-600 text-green-400 rounded w-full py-2 px-3 text-sm font-mono focus:outline-none focus:border-green-500"
                id="email" type="email" placeholder="enter_email" required>
            </div>
            <button
              class="bg-green-700 hover:bg-green-600 text-black font-mono text-xs font-bold py-2 px-4 rounded focus:outline-none"
              type="submit" :disabled="loading">
              <span v-if="loading">CREATING...</span>
              <span v-else>CREATE_USER</span>
            </button>
          </form>
        </div>

        <!-- Users List -->
        <div class="bg-gray-800 border border-gray-700 rounded p-4">
          <h2 class="text-lg font-semibold mb-3 text-green-300">> USERS_LIST</h2>
          <div v-if="loading && users.length === 0" class="text-center py-4 text-gray-500 text-sm">
            LOADING_USERS...
          </div>
          <div v-else-if="users.length === 0" class="text-center py-4 text-gray-500 text-sm">
            NO_USERS_FOUND
          </div>
          <div v-else class="space-y-2 max-h-64 overflow-y-auto">
            <div v-for="user in users" :key="user.id"
              class="bg-gray-900 border border-gray-700 rounded p-2 flex justify-between items-center">
              <div class="flex-1 min-w-0">
                <p class="text-green-300 text-sm font-semibold truncate">{{ user.name }}</p>
                <p class="text-gray-400 text-xs truncate">{{ user.email }}</p>
              </div>
              <div class="flex gap-1 ml-2">
                <button @click="viewUser(user)"
                  class="bg-blue-700 hover:bg-blue-600 text-white text-xs font-mono py-1 px-2 rounded">
                  VIEW
                </button>
                <button @click="editUser(user)"
                  class="bg-yellow-700 hover:bg-yellow-600 text-black text-xs font-mono py-1 px-2 rounded">
                  EDIT
                </button>
                <button @click="deleteUser(user.id)"
                  class="bg-red-700 hover:bg-red-600 text-white text-xs font-mono py-1 px-2 rounded">
                  DEL
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Details/Edit Modal -->
      <div v-if="showDetails" class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
        <div class="bg-gray-800 border border-gray-700 rounded w-full max-w-md">
          <div class="p-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-green-300">
                > {{ isEditing ? 'EDIT_USER' : 'USER_DETAILS' }}
              </h3>
              <button @click="closeDetails" class="text-gray-400 hover:text-gray-200 text-xl">
                ×
              </button>
            </div>

            <div v-if="!isEditing" class="space-y-3">
              <div>
                <label class="block text-gray-300 text-xs font-bold mb-1">ID</label>
                <div class="bg-gray-900 border border-gray-700 rounded p-2 text-green-400 text-sm font-mono">{{
                  currentUser.id }}</div>
              </div>
              <div>
                <label class="block text-gray-300 text-xs font-bold mb-1">NAME</label>
                <div class="bg-gray-900 border border-gray-700 rounded p-2 text-green-400 text-sm font-mono">{{
                  currentUser.name }}</div>
              </div>
              <div>
                <label class="block text-gray-300 text-xs font-bold mb-1">EMAIL</label>
                <div class="bg-gray-900 border border-gray-700 rounded p-2 text-green-400 text-sm font-mono">{{
                  currentUser.email }}</div>
              </div>
            </div>

            <form v-else @submit.prevent="updateUser" class="space-y-3">
              <div>
                <label class="block text-gray-300 text-xs font-bold mb-1" for="edit-name">
                  NAME
                </label>
                <input v-model="currentUser.name"
                  class="bg-gray-900 border border-gray-600 text-green-400 rounded w-full py-2 px-3 text-sm font-mono focus:outline-none focus:border-green-500"
                  id="edit-name" type="text" placeholder="enter_name" required>
              </div>
              <div>
                <label class="block text-gray-300 text-xs font-bold mb-1" for="edit-email">
                  EMAIL
                </label>
                <input v-model="currentUser.email"
                  class="bg-gray-900 border border-gray-600 text-green-400 rounded w-full py-2 px-3 text-sm font-mono focus:outline-none focus:border-green-500"
                  id="edit-email" type="email" placeholder="enter_email" required>
              </div>
              <div class="flex justify-end gap-2 pt-2">
                <button type="button" @click="closeDetails"
                  class="bg-gray-700 hover:bg-gray-600 text-gray-300 font-mono text-xs py-2 px-4 rounded">
                  CANCEL
                </button>
                <button type="submit"
                  class="bg-green-700 hover:bg-green-600 text-black font-mono text-xs py-2 px-4 rounded">
                  UPDATE_USER
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
