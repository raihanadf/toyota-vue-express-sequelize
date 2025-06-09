<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const users = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await axios.get('http://backend:3000/users')
    users.value = response.data
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1>User Management</h1>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <ul>
        <li v-for="user in users" :key="user.id">
          {{ user.name }} - {{ user.email }}
        </li>
      </ul>
    </div>
  </div>
</template>
