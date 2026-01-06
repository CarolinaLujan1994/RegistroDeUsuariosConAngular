import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  form: FormGroup;
  editForm!: FormGroup;
  users: any[] = [];
  errorMessage = '';
  editIndex: number | null = null;
  showPassword = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });

    this.loadUsers();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  passwordMatchValidator(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.form.valid) {
      const email = this.form.value.email;
      const exists = this.users.some(u => u.email === email);

      if (exists) {
        this.errorMessage = 'Este email ya está inscripto';
      } else {
        this.users.push(this.form.value);
        localStorage.setItem('users', JSON.stringify(this.users));
        this.errorMessage = '';
        this.form.reset();
        this.loadUsers();
      }
    }
  }

  loadUsers() {
    this.users = JSON.parse(localStorage.getItem('users') || '[]');
  }

  confirmDelete(user: any) {
    Swal.fire({
      title: `¿Seguro que querés borrar a ${user.name}?`,
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d81b60',
      cancelButtonColor: '#9c27b0',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'roboto-alert',
        title: 'roboto-title',
        confirmButton: 'roboto-btn',
        cancelButton: 'roboto-btn'
      }


    }).then((result) => {
      if (result.isConfirmed) {
        this.users = this.users.filter(u => u.email !== user.email);
        localStorage.setItem('users', JSON.stringify(this.users));
        Swal.fire({
          title: 'Borrado',
          text: 'El usuario ha sido eliminado',
          icon: 'success',
          customClass: {
            popup: 'roboto-alert',
            title: 'roboto-title',
            confirmButton: 'roboto-btn'
          }
        });

      }
    });
  }


  editUser(index: number) {
    this.editIndex = index;
    const user = this.users[index];
    this.editForm = this.fb.group({
      name: [user.name, Validators.required],
      email: [user.email, [Validators.required, Validators.email]],
      password: [user.password, [Validators.required, Validators.minLength(6)]],
    });
  }

  saveEdit(index: number) {
    if (this.editForm.valid) {
      this.users[index] = this.editForm.value;
      localStorage.setItem('users', JSON.stringify(this.users));
      this.editIndex = null;
    }
  }

  cancelEdit() {
    this.editIndex = null;
  }

  downloadPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Lista de Inscriptos', 10, 10);

    let y = 20;
    this.users.forEach((user, i) => {
      doc.text(`${i + 1}. ${user.name} - ${user.email}`, 10, y);
      y += 10;
    });

    doc.save('inscriptos.pdf');
  }
}