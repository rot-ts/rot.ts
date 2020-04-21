// @ts-nocheck
import "jasmine";
import { Speed } from "../../src/scheduler";
import { Simple } from "../../src/scheduler/simple";
import { Action } from "../../src/scheduler/action";

let ROT = {
	"Scheduler" : {
		"Speed" : Speed,
		"Simple" : Simple,
		"Action": Action
	}
};

describe("Scheduler", function() {
	beforeEach(function() {
		jasmine.addMatchers({
			toSchedule: function(util, customEqualityTesters) {
				var compare = function(actual, expected) {
					actual = actual.map(JSON.stringify);
					expected = expected.map(JSON.stringify);

					var pass = true;
					for (var i=0;i<Math.max(expected.length, actual.length);i++) {
						if (actual[i] !== expected[i]) { pass = false; }
					}

					var notText = pass ? " not" : "";
					var message = "Expected " + actual + notText + " to be scheduled as " + expected;

					return { pass: pass, message: message };
				}
				return { compare: compare };
			}
		});
	});

	describe("Simple", function() {
		var S = new ROT.Scheduler.Simple();
		var A1 = "A1";
		var A2 = "A2";
		var A3 = "A3";
		beforeEach(function() { S.clear(); });

		it("should schedule actors evenly", function() {
			S.add(A1, true);
			S.add(A2, true);
			S.add(A3, true);
			var result = [];
			for (var i=0;i<6;i++) { result.push(S.next()); }
			expect(result).toSchedule([A1, A2, A3, A1, A2, A3]);
		});

		it("should schedule one-time events", function() {
			S.add(A1, false);
			S.add(A2, true);
			var result = [];
			for (var i=0;i<4;i++) { result.push(S.next()); }
			expect(result).toSchedule([A1, A2, A2, A2]);
		});

		it("should remove repeated events", function() {
			S.add(A1, false);
			S.add(A2, true);
			S.add(A3, true);
			S.remove(A2);
			var result = [];
			for (var i=0;i<4;i++) { result.push(S.next()); }
			expect(result).toSchedule([A1, A3, A3, A3]);
		});

		it("should remove one-time events", function() {
			S.add(A1, false);
			S.add(A2, false);
			S.add(A3, true);
			S.remove(A2);
			var result = [];
			for (var i=0;i<4;i++) { result.push(S.next()); }
			expect(result).toSchedule([A1, A3, A3, A3]);
		});

	});

	describe("Speed", function() {
		var S = new ROT.Scheduler.Speed();
		var A = {getSpeed:function(){return this.speed;}};
		var A50 = Object.create(A); A50.speed = 50;
		var A100a = Object.create(A); A100a.speed = 100;
		var A100b = Object.create(A); A100b.speed = 100;
		var A200 = Object.create(A); A200.speed = 200;

		beforeEach(function() { S.clear(); });

		it("should schedule same speed evenly", function() {
			S.add(A100a, true);
			S.add(A100b, true);
			var result = [];
			for (var i=0;i<4;i++) { result.push(S.next()); }

			expect(result).toSchedule([A100a, A100b, A100a, A100b]);
		});

		it("should schedule different speeds properly", function() {
			S.add(A50, true);
			S.add(A100a, true);
			S.add(A200, true);
			var result = [];
			for (var i=0;i<7;i++) { result.push(S.next()); }
			expect(result).toSchedule([A200, A100a, A200, A200, A50, A100a, A200]);
		});

		it("should schedule with initial offsets", function() {
			S.add(A50, true, 1/300);
			S.add(A100a, true, 0);
			S.add(A200, true);
			var result = [];
			for (var i=0;i<9;i++) { result.push(S.next()); }
			expect(result).toSchedule([A100a, A50, A200, A100a, A200, A200, A100a, A200, A50]);
		});

		it("should look up the time of an event", function() {
			S.add(A100a, true);
			S.add(A50, true, 1/200);
			expect(S.getTimeOf(A50)).toEqual(1/200);
			expect(S.getTimeOf(A100a)).toEqual(1/100);
		});

	});

	describe("Action", function() {
		var S = null;
		var A1 = "A1";
		var A2 = "A2";
		var A3 = "A3";
		beforeEach(function() { S = new ROT.Scheduler.Action(); });

		it("should schedule evenly by default", function() {
			S.add(A1, true);
			S.add(A2, true);
			S.add(A3, true);
			var result = [];
			for (var i=0;i<6;i++) { result.push(S.next()); }
			expect(result).toSchedule([A1, A2, A3, A1, A2, A3]);
		});

		it("should schedule with respect to extra argument", function() {
			S.add(A1, true);
			S.add(A2, true, 2);
			S.add(A3, true);
			var result = [];
			for (var i=0;i<6;i++) { result.push(S.next()); }
			expect(result).toSchedule([A1, A3, A2, A1, A3, A2]);
		});

		it("should schedule with respect to action duration", function() {
			S.add(A1, true);
			S.add(A2, true);
			S.add(A3, true);
			var result = [];

			result.push(S.next());
			S.setDuration(10);

			result.push(S.next());
			S.setDuration(5);

			result.push(S.next());
			S.setDuration(1);
			expect(S.getTime()).toEqual(1);

			for (var i=0;i<3;i++) { 
				result.push(S.next()); 
				S.setDuration(100); /* somewhere in the future */
			}

			expect(result).toSchedule([A1, A2, A3, A3, A2, A1]);
		});
	});

	describe("Zero-ID actor", function() {
		let schedulers = [ROT.Scheduler.Simple, ROT.Scheduler.Action];
		schedulers.forEach((schedulerCtor, i) => describe(`scheduler ${i}`, function() {
			let s = new schedulerCtor();
			var A1 = 0;

			it("should schedule the zero-id actor", function() {
				s.add(A1, true);
				var result = [];
				for (var i=0;i<6;i++) { result.push(s.next()); }
				expect(result).toSchedule([A1, A1, A1, A1, A1, A1]);
			});
		}));
	});
});
