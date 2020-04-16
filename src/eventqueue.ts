export class EventQueue<T = any> {
	_time: number;
	_eventTimes: number[];
	_events: T[];

	/**
	 * @class Generic event queue: stores events and retrieves them based on their time
	 */
	constructor() {
		this._time = 0;
		this._events = [];
		this._eventTimes = [];
	}

	/**
	 * @returns {number} Elapsed time
	 */
	getTime() { return this._time; }

	/**
	 * Clear all scheduled events
	 */
	clear() {
		this._events = [];
		this._eventTimes = [];
		return this;
	}

	/**
	 * @param {?} event
	 * @param {number} time
	 */
	add(event: T, time: number) {
		let index = this._events.length;
		for (let i=0;i<this._eventTimes.length;i++) {
			if (this._eventTimes[i] > time) {
				index = i;
				break;
			}
		}

		this._events.splice(index, 0, event);
		this._eventTimes.splice(index, 0, time);
	}

	/**
	 * Locates the nearest event, advances time if necessary. Returns that event and removes it from the queue.
	 * @returns {? || null} The event previously added by addEvent, null if no event available
	 */
	get() {
		if (!this._events.length) { return null; }

		let time = this._eventTimes.splice(0, 1)[0];
		if (time > 0) { /* advance */
			this._time += time;
			for (let i=0;i<this._eventTimes.length;i++) { this._eventTimes[i] -= time; }
		}

		return this._events.splice(0, 1)[0];
	}

	/**
	 * Get the time associated with the given event
	 * @param {?} event
	 * @returns {number} time
	 */
	getEventTime(event: T) {
		let index = this._events.indexOf(event);
		if (index == -1) { return undefined }
		return this._eventTimes[index];
	}

	/**
	 * Remove an event from the queue
	 * @param {?} event
	 * @returns {bool} success?
	 */
	remove(event: T) {
		let index = this._events.indexOf(event);
		if (index == -1) { return false }
		this._remove(index);
		return true;
	};

	/**
	 * Remove an event from the queue
	 * @param {int} index
	 */
	_remove(index: number) {
		this._events.splice(index, 1);
		this._eventTimes.splice(index, 1);
	};
}
