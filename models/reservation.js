/** Reservation for Lunchly */

import * as datefns from "date-fns";
import db from "../db.js";

/** A reservation for a party */

class Reservation {
  constructor({ id, customerId, numGuests, startAt, notes }) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** formatter for startAt */

  getFormattedStartAt() {
    return datefns.format(this.startAt, "MMMM d yyyy, h:mm a")
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id,
                  customer_id AS "customerId",
                  num_guests AS "numGuests",
                  start_at AS "startAt",
                  notes AS "notes"
           FROM reservations
           WHERE customer_id = $1`,
        [customerId],
    );

    return results.rows.map(row => new Reservation(row));
  }


  /** Save this reservation to the DB.
   * This adds a reservation if they are not located already in the DB.
   * Otherwise we update the reservation's information for:
   * numGuests, startAt, and notes.
  */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, start_at, num_guests, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.customerId, this.startAt, this.numGuests, this.notes],
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations
             SET start_at=$1,
                 num_guests=$2,
                 notes=$3
             WHERE id = $4`, [
        this.startAt,
        this.numGuests,
        this.notes,
        this.id,
      ],
      );
    }
  }

}


export default Reservation;
