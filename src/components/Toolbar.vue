<template>
  <ion-toolbar color="primary">
    <ion-title>ROMI Móvil</ion-title>
    <ion-buttons slot="end" v-if="auth.isLogged">
      <ion-button @click="auth.logout(); $router.push('/login')">Salir</ion-button>
    </ion-buttons>
  </ion-toolbar>
</template>

<script setup lang="ts">
import { IonToolbar, IonTitle, IonButtons, IonButton } from '@ionic/vue'
import { useAuth } from '@/store/auth'
const auth = useAuth()
</script>
