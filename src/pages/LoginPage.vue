<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Ingreso administrador</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-input v-model="u" label="Usuario" label-placement="floating" />
      </ion-item>
      <ion-item>
        <ion-input v-model="p" type="password" label="Contraseña" label-placement="floating" />
      </ion-item>
      <ion-button expand="block" class="ion-margin-top" @click="login">Entrar</ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton } from '@ionic/vue'
const u = ref('admin'); const p = ref('admin'); const router = useRouter()
function login(){
  if (u.value==='admin' && p.value==='admin'){
    localStorage.setItem('romi_user', JSON.stringify({ username: 'admin'}))
    router.push('/tabs')
  } else alert('Credenciales inválidas')
}
</script>
