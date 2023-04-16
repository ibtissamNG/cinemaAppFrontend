import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CinemaService } from '../services/cinema.service';

@Component({
  selector: 'app-cinema',
  templateUrl: './cinema.component.html',
  styleUrls: ['./cinema.component.css']
})
export class CinemaComponent implements OnInit  {

  villes: any;
  cinemas: any;
  salles: any;

  currentVille: any;
  currentCinema: any;
  currentProjection:any;
  selectedTickets: any;


  constructor(private http: HttpClient, public cinemaService: CinemaService){}

  ngOnInit(): void {
    this.cinemaService.getVilles().subscribe({
    next: (data) =>  this.villes = data,
    error: (err) => console.log(err),
  });
}

onGetCinemas(ville: any) {
  this.currentVille=ville;
  this.salles = undefined;
  this.cinemaService.getCinemas(ville).subscribe({
    next: (data)=> this.cinemas = data,
    error: (err) => console.log(err)
  })
}

onGetSalle(cinema: any ){
  this.currentCinema = cinema;
  this.cinemaService.getSalles(cinema).subscribe({
    next: (data) => {this.salles = data;
      // pour chaque salle on envoie une requete pour recuperer sa projection (qui contient un ensemble d'infos sur la salle )
      this.salles._embedded.salles.forEach((salle: { projections: Object; }) => {
        this.cinemaService.getProjections(salle).subscribe({
          next: (data)=> salle.projections = data,
          error: (err)=> console.log(err)
        })
      })
    },error: (err)=> console.log(err)
  })
}

onGetTicketsPlaces(projection: any){
  this.currentProjection = projection;
  this.cinemaService.getTicketPlaces(projection).subscribe({
    next: (data)=> {
      this.currentProjection.tickets = data;
      this.selectedTickets=[]
  },
    error: (err)=> console.log(err)
  });
}

onSelectTicket(ticket: any){  
  if(!ticket.selected) {
    ticket.selected = true;
    this.selectedTickets.push(ticket);
  } else {
    ticket.selected=false;
    this.selectedTickets.splice(this.selectedTickets.indexOf(ticket),1);
  }
}

getTicketClass(ticket: any){
  let res = "btn m-1 fw-bold text-white ";
  if(ticket.reserve) res+="btn-danger"
  else if(ticket.selected) res+="btn-warning"
  else res+="btn-lightBlue"
  return res
} 

onPayTickets(formData:any){
  let tickets: any[] = [];
  this.selectedTickets.forEach((t: { id: any; })=>{
    tickets.push(t.id);
  });
  formData.tickets = tickets;
  this.cinemaService.payerTickets(formData).subscribe({
    next: (data)=> {
      alert("Réservation accomplie avec succès");
      this.onGetTicketsPlaces(this.currentProjection);
  },
    error: (err)=> console.log(err)
  })
}
}
