"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface NameInputModalProps {
  isOpen: boolean
  onClose: () => void
  onNameSubmit: (name: string) => void
}

export function NameInputModal({ isOpen, onClose, onNameSubmit }: NameInputModalProps) {
  const [name, setName] = useState("")

  const handleSubmit = () => {
    if (name.trim()) {
      onNameSubmit(name.trim())
      setName("") // Clear input after submission
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-xl border-white/30 shadow-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Enter Name</DialogTitle>
          <DialogDescription>Please enter the name you wish to submit.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., John Doe"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit Name</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
