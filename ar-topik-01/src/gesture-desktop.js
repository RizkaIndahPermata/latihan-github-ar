// @ts-nocheck
import * as ecs from '@8thwall/ecs'

ecs.registerComponent({
  name: 'gesture-desktop',
  add: (world, component) => {
    const { eid } = component
    let isDragging = false
    let lastX = 0
    let initDist = 0
    let startScale = { x: 1, y: 1, z: 1 }
    
    let currentRot = { x: 0, y: 0, z: 0, w: 1 }

    // KUNCI PERBAIKAN: Deteksi nama sistem rotasinya dari awal (Quaternion)
    const Rot = ecs.Rotation || ecs.Quaternion

    const getDist = (touches) => {
      const dx = touches[0].screenX - touches[1].screenX
      const dy = touches[0].screenY - touches[1].screenY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const onStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true
        lastX = e.touches[0].screenX
        
        // Membaca rotasi sekarang menggunakan variabel Rot yang aman
        if (Rot) {
          const r = Rot.get(world, eid)
          if (r) currentRot = { ...r }
        }
        
      } else if (e.touches.length === 2) {
        isDragging = false
        initDist = getDist(e.touches)
        const s = ecs.Scale.get(world, eid)
        if (s) startScale = { ...s }
      }
    }

    const onMove = (e) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].screenX - lastX
        lastX = e.touches[0].screenX
        
        const deltaRot = deltaX * 0.01 
        
        const qY = {
          x: 0,
          y: Math.sin(deltaRot / 2),
          z: 0,
          w: Math.cos(deltaRot / 2)
        }
        
        const newRot = {
          x: qY.w * currentRot.x + qY.y * currentRot.z,
          y: qY.w * currentRot.y + qY.y * currentRot.w,
          z: qY.w * currentRot.z - qY.y * currentRot.x,
          w: qY.w * currentRot.w - qY.y * currentRot.y
        }
        
        if (Rot) {
          Rot.set(world, eid, newRot)
        }
        currentRot = newRot
        
      } else if (e.touches.length === 2 && initDist > 0) {
        const factor = getDist(e.touches) / initDist
        ecs.Scale.set(world, eid, {
          x: startScale.x * factor, 
          y: startScale.y * factor, 
          z: startScale.z * factor
        })
      }
    }

    const onEnd = () => { isDragging = false }

    window.addEventListener('touchstart', onStart)
    window.addEventListener('touchmove', onMove)
    window.addEventListener('touchend', onEnd)

    component.cleanup = () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
  },
  remove: (world, component) => {
    if (component.cleanup) component.cleanup()
  }
})