import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
//import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import {Firestore,collectionData,collection} from '@angular/fire/firestore';

export interface Item{nombre:string; url:string;}

@Component({
  selector: 'app-fotos',
  templateUrl: './fotos.component.html',
  styles: []
})

export class FotosComponent implements OnInit {
  
  //private itemsCollection: AngularFirestoreCollection<Item>;
  afs=inject(Firestore);
  private itemsCollection=collection(this.afs,'auth');
  items: Observable<Item[]>;


  constructor(//private afs: Firestore,//AngularFirestore,
              private _auth:AuthService,
              private router:Router ) {
    if(this._auth.nivelUsuario()<2){
      this.router.navigateByUrl('/home');
    }//*/
    //this.itemsCollection = afs.collection<Item>('img');
    this.itemsCollection = collection(this.afs,'img');
    this.items = collectionData(this.itemsCollection) as Observable<Item[]>;
    //this.items = this.itemsCollection.valueChanges();
   }

  ngOnInit() {
  }

}
