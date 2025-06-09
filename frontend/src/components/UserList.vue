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
  if (!newUser.value.name || !newUser.value.email) {
    error.value = 'Name and email are required'
    return
  }

  loading.value = true
  try {
    const response = await axios.post('http://localhost:3000/users', newUser.value)
    users.value.push(response.data)
    success.value = 'User created successfully!'
    error.value = null
    
    newUser.value = { name: '', email: '' }
    
    await fetchUsers()
  } catch (err) {
    error.value = 'Failed to create user: ' + 
      (err.response?.data?.message || err.message)
    console.error('Error creating user:', err)
  } finally {
    loading.value = false
    
    if (success.value) {
      setTimeout(() => {
        success.value = null
      }, 3000)
    }
  }
}

onMounted(fetchUsers)
</script>

<template>
  <div class="container mx-auto p-4 max-w-2xl">
    <h1 class="text-3xl font-bold mb-6">User Management</h1>
    
    <!-- Error message -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>
    
    <!-- Success message -->
    <div v-if="success" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      {{ success }}
    </div>
    
    <!-- Create User Form -->
    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
      <h2 class="text-xl font-semibold mb-4">Create New User</h2>
      <form @submit.prevent="createUser">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="name">
            Name
          </label>
          <input 
            v-model="newUser.name"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
            id="name" 
            type="text" 
            placeholder="Enter name"
          >
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
            Email
          </label>
          <input 
            v-model="newUser.email"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
            id="email" 
            type="email" 
            placeholder="Enter email"
          >
        </div>
        <div class="flex items-center justify-between">
          <button 
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
            type="submit"
            :disabled="loading"
          >
            <span v-if="loading">Creating...</span>
            <span v-else>Create User</span>
          </button>
        </div>
      </form>
    </div>
    
    <!-- Users List -->
    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8">
      <h2 class="text-xl font-semibold mb-4">Users List</h2>
      <div v-if="loading && users.length === 0" class="text-center py-4">
        Loading users...
      </div>
      <div v-else-if="users.length === 0" class="text-center py-4 text-gray-500">
        No users found.
      </div>
      <ul v-else class="divide-y divide-gray-200">
        <li v-for="user in users" :key="user.id" class="py-4 flex justify-between items-center">
          <div>
            <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
            <p class="text-sm text-gray-500">{{ user.email }}</p>
          </div>
          <div class="flex space-x-2">
            <!-- You can add edit and delete buttons here later -->
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
