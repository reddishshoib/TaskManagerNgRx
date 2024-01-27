import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Task} from "../../model/task";
import {TaskService} from "../../service/task.service";
import {Observable} from "rxjs";
import {select, Store} from "@ngrx/store";
import {loadTasks} from "../../store/action/task.action";
import {selectError, selectLoading, selectTasks} from "../../store/selector/task.selector";
@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit{

  tasks:Task[]=[]
  tasks$!: Observable<Task[]>;
  loading$!: Observable<boolean>;
  error$!: Observable<any>;
  isPopUpVisible:boolean =  false
  taskToEdit: Task | null = null;
  togglePopUp(){
    this.isPopUpVisible = !this.isPopUpVisible
  }

  constructor(
    private taskService:TaskService,
    private changeDetector:ChangeDetectorRef,
    private store: Store<Task>
  ) {  }
  ngOnInit() {
    this.store.dispatch(loadTasks());
    this.tasks$ = this.store.pipe(select(selectTasks));
    this.loading$ = this.store.pipe(select(selectLoading));
    this.error$ = this.store.pipe(select(selectError));
  }

  onSaveTask(task:Task){
    console.log(task.id,'hello')
    if (task.id || task.id===0){
      const index = this.tasks.findIndex(t => t.id === task.id);
      this.tasks[index] = task;
      this.taskService.updateTask(task).subscribe(
        (response)=>{
          if (response.ok){
            console.log('Task Updated Successfully', response.status)
            this.isPopUpVisible = !this.isPopUpVisible
          }else {
            console.log('Task Not Updated')
          }
        },
        (error)=>{
          console.log('Error  Updating task', error)
        }
      )
    }else{
      task.id = this.getNextTaskId();
      this.tasks.push(task);
      this.taskService.addTask(task).subscribe(
        (response)=>{
          if (response.ok){
            console.log("Task Added Successfully", response.status)
            this.isPopUpVisible = !this.isPopUpVisible
          }else{
            console.log("Task Not Added")
          }
        },
        error => {
          console.log("Error saving task",error);
        }
      )
    }
  }

  deletebyid(id: number) {
    this.taskService.deleteById(id).subscribe(
      (response)=>{
        if (response.status ===200){
          console.log('Deleted Succefully')
          this.tasks= this.tasks.filter(task=>task.id!==id)
          this.changeDetector.detectChanges()
        }
      }
    )
  }

  getNextTaskId(): number {
    const maxId = Math.max(...this.tasks.map(task => task.id), 0);
    return maxId + 1;
  }

  editbyid(id: number) {
    this.taskService.getTaskById(id).subscribe(
      (task:Task)=>{
        this.taskToEdit=task;
        // console.log(this.taskToEdit)
        this.togglePopUp()
      },
      (error) => {
        console.log('Error',error)
      }
    )
  }
}
