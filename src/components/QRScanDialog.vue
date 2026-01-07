<script setup >
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import QRScanner from './QRScanner.vue';
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="outline">
        Scan QR
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Join a room by scanning qr code</DialogTitle>
      </DialogHeader>
      <div class="flex items-center gap-2">
        <QRScanner />
      </div>
      <DialogFooter class="sm:justify-start">
        <DialogClose as-child>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
