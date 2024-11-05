import { Component, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FieldComponent } from "./components/field.component";
import { MatButton } from "@angular/material/button";

@Component({
  selector: 'app-root', // Der Selektor, der diese Komponente im HTML-Dokument identifiziert
  standalone: true, // Gibt an, dass diese Komponente eigenständig ist und nicht in ein Modul eingebunden werden muss
  imports: [RouterOutlet, FieldComponent, MatButton], // Importiert notwendige Module und Komponenten
  templateUrl: './app.component.html', // Der Pfad zur HTML-Datei dieser Komponente
  styleUrls: ['./app.component.scss'] // Der Pfad zur CSS-Datei dieser Komponente
})
export class AppComponent {
  // Signale für den Gewinner, das Spielfeld und die aktuelle Runde
  protected readonly winner: WritableSignal<number> = signal(0);
  protected readonly grid: WritableSignal<number[][]> = signal(this.InitGrid());
  protected readonly turn: WritableSignal<number> = signal(-1);

  // Initialisiert das Spielfeld mit Nullen (leere Felder)
  private InitGrid(): number[][] {
    return Array.from({ length: 3 }, () => Array(3).fill(0));
  }

  // Wechselt den Spieler nach jedem Zug
  public swapTurn(): void {
    this.turn.update(turn => (turn === -1 ? 1 : -1));
  }

  // Aktualisiert das Spielfeld und überprüft den Gewinner
  protected UpdateGrid(row: number, col: number): void {
    if (this.winner() !== 0) return; // Beendet die Funktion, wenn es bereits einen Gewinner gibt

    this.grid.update(grid => {
      if (grid[row][col] === 0) { // Prüft, ob das Feld leer ist
        grid[row][col] = this.turn(); // Setzt das Feld auf den Wert des aktuellen Spielers
        this.swapTurn(); // Wechselt den Spieler
        this.winner.set(this.DetermineWinner(grid)); // Bestimmt, ob es einen Gewinner gibt
      }
      return grid;
    });
  }

  // Setzt das Spiel zurück
  public ResetGame(): void {
    this.winner.set(0);
    this.grid.update(() => this.InitGrid());
  }

  // Bestimmt den Gewinner des Spiels
  private DetermineWinner(grid: number[][]): number {
    const lines = [
      ...grid, // Reihen
      [grid[0][0], grid[1][0], grid[2][0]], // Spalte 1
      [grid[0][1], grid[1][1], grid[2][1]], // Spalte 2
      [grid[0][2], grid[1][2], grid[2][2]], // Spalte 3
      [grid[0][0], grid[1][1], grid[2][2]], // Diagonale von oben links nach unten rechts
      [grid[0][2], grid[1][1], grid[2][0]]  // Diagonale von oben rechts nach unten links
    ];

    // Überprüft, ob eine der Linien drei gleiche Werte (1 oder -1) enthält
    for (const line of lines) {
      const sum = line.reduce((acc, cell) => acc + cell, 0);
      if (sum === 3) return 1; // Spieler 1 (O) gewinnt
      if (sum === -3) return -1; // Spieler -1 (X) gewinnt
    }

    // Überprüft, ob alle Felder belegt sind und es keine Gewinner gibt (Unentschieden)
    return grid.every(row => row.every(cell => cell !== 0)) ? 404 : 0;
  }
}
