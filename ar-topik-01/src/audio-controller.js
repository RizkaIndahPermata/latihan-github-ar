// @ts-nocheck
import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'audio-controller',
  add: (world, component) => {
    const { eid } = component
    const btnSuara = document.getElementById('btn-suara')
    const btnPenjelasan = document.getElementById('btn-penjelasan')
    const audioSuara = document.getElementById('audio-suara')
    const audioPenjelasan = document.getElementById('audio-penjelasan')

    // Fungsi andalan: Matikan semua suara
    const stopAllAudio = () => {
      if (audioSuara) { 
        audioSuara.pause() 
        audioSuara.currentTime = 0 
      }
      if (audioPenjelasan) { 
        audioPenjelasan.pause() 
        audioPenjelasan.currentTime = 0 
      }
    }

    // Tombol diklik -> Mainkan
    if (btnSuara) {
      btnSuara.addEventListener('click', () => { 
        stopAllAudio(); audioSuara.play(); 
      })
    }
    if (btnPenjelasan) {
      btnPenjelasan.addEventListener('click', () => { 
        stopAllAudio(); audioPenjelasan.play(); 
      })
    }

    // --------------------------------------------------
    // LOGIKA BARU: SAAT MARKER HILANG DARI KAMERA
    // --------------------------------------------------
    const onMarkerLost = () => {
      console.log("Marker hilang! Mematikan semua suara...")
      stopAllAudio()
    }

    // Daftarkan event "Lost" ke sistem Niantic
    world.events.addListener(eid, 'b8.image-target-lost', onMarkerLost)
    world.events.addListener(eid, 'image-target-lost', onMarkerLost)

    component.cleanup = () => {
      world.events.removeListener(eid, 'b8.image-target-lost', onMarkerLost)
      world.events.removeListener(eid, 'image-target-lost', onMarkerLost)
    }
    console.log("Marker hilang! Mematikan semua suara...")
  },
  
  remove: (world, component) => {
    if (component.cleanup) component.cleanup()
  }
})