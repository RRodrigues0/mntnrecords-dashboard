require('dotenv').config();

const express = require('express');
const payload = require('payload');
const app = express();
const day = 86400000;
const fs = require("fs");
const { parse } = require("csv-parse");

const fileUpload = require('express-fileupload');
const session = require('express-session');
const compression = require('compression');

payload.init({
	secret: process.env.PAYLOAD_SECRET,
	mongoURL: process.env.MONGODB_URI,
	express: app,
	email: {
		transportOptions: {
			host: process.env.SMTP_HOST,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS
			},
			port: 587,
			secure: false,
			tls: {
				rejectUnauthorized: false
			}
		},
		fromName: 'MNTN Records',
		fromAddress: 'noreply@mntnrecords.com'
	},
});

app.set('view engine', 'jade');
app.use(fileUpload({ createParentPath: true }));
app.use(express.urlencoded({ extended: true }));
app.use(compression({ brotli: { enabled: true, zlib: { } } }))
app.use(session({ secret: 'secret',resave: true,saveUninitialized: true }));

app.use('/public/css', express.static('public/css', { maxAge: day }));
app.use('/public/fonts', express.static('public/fonts', { maxAge: day }));
app.use('/public/images', express.static('public/images', { maxAge: day }));
app.use('/public/js', express.static('public/js', { maxAge: day }));

app.listen(7000);

(function newUser() {
	function localOnly(req,res,next) {
		var hostmachine = req.headers.host.split(':')[0];
		if (hostmachine !== 'localhost')
			return res.send(401);
		next();
	}

	app.get('/api/newuser', localOnly, async function (req, res) {
		let email = req.query.id;
		res.send(true);

		payload.sendEmail({
			from: 'MNTN Records <noreply@mntnrecords.com>',
			to: email,
			subject: "Welcome to your personal dashboard",
			html:
				"<p>Congratulations, your access to the MNTN Records Dashboard has been enabled!</p>" +
				"<p>" +
				"<span><b>Email:</b> " + email + "</span><br>" +
				"<span><b>Password:</b> " + email + "</span>" +
				"</p>" +
				"<p>Click the link below to log in. <b>Please change your password afterwards!</b></p>" +
				"<p><a href='https://dashboard.mntnrecords.com/'>https://dashboard.mntnrecords.com/</a></p>"
		});
	});
})();

(function addRelease() {
	function localOnly(req,res,next){
		var hostmachine = req.headers.host.split(':')[0];
		if(hostmachine !== 'localhost')
			return res.send(401);
		next();
	}

	app.get('/api/addrelease', localOnly, async function (req, res) {
		let id = req.query.id;
		res.send(true);

		let find = await payload.find({
			collection: 'files',
			where: {
				'id': {
					equals: id
				}
			},
		});

		find = find.docs[0];

		fs.createReadStream("public/uploads/files/" + find.filename).pipe(parse({ delimiter: ",", from_line: 2 })).on("data", async function (release) {
			let name = release[1];
			let barcode = Number(release[2]);
			let streams = Number(release[4]);
			let downloads = Number(release[3]);
			let streams_revenue = Number(release[7]);
			let downloads_revenue = Number(release[6]);
			let total = Number(release[9]);
			let monthAt = release[0];

			let find = await payload.find({
				collection: 'releases',
				where: {
					'barcode': {
						equals: barcode
					}
				},
				showHiddenFields: true,
			});

			if(!find.docs.length) {
				find = await payload.find({
					collection: 'releases',
					where: {
						'release_title': {
							equals: name
						},
						'barcode': {
							equals: 0
						}
					},
					showHiddenFields: true,
				})
			}

			if(find.docs.length) {
				find = find.docs[0];

				if(find.monthAt === undefined || new Date(find.monthAt).getTime() !== new Date(monthAt).getTime()) {
					let x = true;

					if(find.monthAt !== undefined) {
						let history = await payload.findVersions({
							collection: 'releases',
							showHiddenFields: true,
							limit: 1000,
						});

						history = history.docs;

						history.forEach(function (entry) {
							if(x === true) {
								if(entry.version.release_title === find.release_title) {
									if(new Date(entry.version.monthAt).getTime() === new Date(monthAt).getTime()) {
										x = false;
									}
								}
							}
						});
					}

					if(x === true) {
						let mntn_total = 0;
						let mntn_remaining = 0;
						let mntn_reserved = find.mntnrecords.reserved - total;

						if(mntn_reserved < 0) {

							mntn_reserved = find.mntnrecords.reserved

							if(mntn_reserved === 0) {
								mntn_total = find.mntnrecords.total + (total * (find.mntnrecords.percent / 100));
								mntn_remaining = find.mntnrecords.remaining + (total * (find.mntnrecords.percent / 100));
							} else {
								mntn_total = find.mntnrecords.total + mntn_reserved;
								mntn_remaining = find.mntnrecords.remaining + mntn_reserved;
								total = total - mntn_reserved;
							}

							let artists = [];
							find.artists.forEach(function(artist) {
								let artist_total = artist.total + (total * (artist.percent / 100));
								let artist_remaining = artist.remaining + (total * (artist.percent / 100));

								artists.push({
									user: artist.user.id,
									total: artist_total.toFixed(2),
									remaining: artist_remaining.toFixed(2),
									percent: artist.percent
								});
							});

							await payload.update({
								collection: 'releases',
								id: find.id,
								data: {
									barcode: barcode,
									mntnrecords: {
										total: mntn_total.toFixed(2),
										remaining: mntn_remaining.toFixed(2),
										reserved: 0
									},
									streams: {
										value: find.streams.value + streams,
										revenue: (find.streams.revenue + streams_revenue).toFixed(2)
									},
									downloads: {
										value: find.downloads.value + downloads,
										revenue: (find.downloads.revenue + downloads_revenue).toFixed(2)
									},
									monthAt: monthAt,
									artists: artists
								},
								showHiddenFields: true,
							});

							let month = new Date().toLocaleString('default', { month: 'long' });
							let year = new Date().toLocaleString('default', { year: 'numeric' });

							// let users = await payload.find({
							// 	collection: 'users',
							// 	limit: 1000
							// });
							//
							// users = users.docs;
							//
							// users.forEach(function(artist) {
							// 	payload.sendEmail({
							// 		from: 'MNTN Records <noreply@mntnrecords.com>',
							// 		to: artist.user.email,
							// 		subject: "Your " + month + " " + year + " sales report is now available",
							// 		html:
							// 			"<p>Congratulations, " + artist.user.first_name + "!</p>" +
							// 			"<p>People are playing your songs - and your bank balance is growing! Click the link below to see your full sales and streaming numbers.</p>" +
							// 			"<p><a href='https://dashboard.mntnrecords.com/'>https://dashboard.mntnrecords.com/</a></p>"
							// 	});
							// });
						} else {

							mntn_total = find.mntnrecords.total + total;
							mntn_remaining = find.mntnrecords.remaining + total;

							await payload.update({
								collection: 'releases',
								id: find.id,
								data: {
									barcode: barcode,
									mntnrecords: {
										total: mntn_total.toFixed(2),
										remaining: mntn_remaining.toFixed(2),
										reserved: mntn_reserved.toFixed(2)
									},
									streams: {
										value: find.streams.value + streams,
										revenue: (find.streams.revenue + streams_revenue).toFixed(2)
									},
									downloads: {
										value: find.downloads.value + downloads,
										revenue: (find.downloads.revenue + downloads_revenue).toFixed(2)
									}
								},
								showHiddenFields: true,
							});
						}
					}
				}
			}
		});
	});
})();

(function login() {
	let data = {
		title: "MNTN Records Dashboard | Login",
		desc: "MNTN Records Dashboard"
	};

	app.get('/login', function (req, res) {
		if (!req.session.loggedin) {
			res.render("login", data);
		} else {
			res.redirect('/');
		}


	});

	app.post('/login', function (req, res) {
		let error = false;

		if (!req.session.loggedin) {
			let form = req.body;

			async function auth() {
				req.session.userdata = false;

				try {
					let login = await payload.login({
						collection: 'users',
						data: {
							email: form.username,
							password: form.password,
						},
					});
					req.session.loggedin = true;
					req.session.userdata = login.user;
					res.redirect('/');
				} catch (error) {
					error = "Invalid email or password";
					return error;
				}
			}
			auth().then(function(error) {
				if(error) {
					res.render("login", {data, error: error});
				}
			});
		} else {
			res.redirect('/');
		}
	});
})();

(function logout() {
	app.get('/logout', function (req, res) {
		req.session.destroy(() => {
			res.redirect('/login');
		})
	});
})();

(function profile() {
	let data = {
		title: "MNTN Records Dashboard | Profile",
		desc: "MNTN Records Dashboard"
	}

	app.get('/profile', function (req, res) {
		if (!req.session.loggedin) {
			res.redirect('/logout');
		} else {
			if (!req.session.releases) {
				res.redirect('/');
			} else {
				data["userdata"] = req.session.userdata
				data["success_passwd"] = false;
				data["error_passwd"] = false;

				res.render("profile", data);
			}
		}
	});

	app.post('/profile', function (req, res) {
		let error_passwd = false;
		let success_passwd = false;

		if (!req.session.loggedin) {
			res.redirect('/login');
		} else {
			if (!req.session.releases) {
				res.redirect('/');
			} else {
				async function update() {
					let data = req.body;
					let newPasswd = data.newPassword;
					let confirmPasswd = data.confirmPassword;

					function validatePassword() {
						if(newPasswd == confirmPasswd) {
							if(newPasswd.length > 7) {
								return true;
							} else {
								return error_passwd = "Your password is too short. Please use one with at least 8 characters.";
							}
						} else {
							return error_passwd = "The passwords do not match each other. Please check your input.";
						}
					}

					if(validatePassword() === true) {
						try {
							async function getToken() {
								let token = await payload.forgotPassword({
									collection: 'users',
									data: {
										email: req.session.userdata.email,
									},
									req: req,
									disableEmail: true
								});
								return token;
							}
							getToken().then(async function(token) {
								let result = await payload.resetPassword({
									collection: 'users',
									data: {
										token: token,
										password: newPasswd,
									},
									req: req
								});
							});
							payload.sendEmail({
								from: 'MNTN Records <noreply@mntnrecords.com>',
								to: req.session.userdata.email,
								subject: "Password reset",
								html: "<p>Your password has been successfully changed.</p>"
							});
							let msg = "Your password has been successfully changed.";
							let arr = [];
							arr.push('success_passwd');
							arr.push(msg);
							return arr;
						} catch (error_passwd) {
							let msg = "Oops! Something went wrong. Please try again. (" + error_passwd + ")";
							let arr = [];
							arr.push('error_passwd');
							arr.push(msg);
							return arr;
						}
					} else {
						let msg = error_passwd;
						let arr = [];
						arr.push('error_passwd');
						arr.push(msg);
						return arr;
					}
				}
				update().then(function(result) {
					if(result[0] == 'success_passwd') {
						success_passwd = result[1];
					}
					if(result[0] == 'error_passwd') {
						error_passwd = result[1];
					}

					async function userdata() {
						let userdata = await payload.findByID({
							collection: 'users',
							id: req.session.userdata.id,
						});
						req.session.userdata = userdata;
					}
					userdata().then(function() {
						data["userdata"] = req.session.userdata;
						data["success_passwd"] = success_passwd;
						data["error_passwd"] = error_passwd;

						res.render("profile", data);

					});
				});
			}
		}
	});
})();

(function payout() {
	let data = {
		title: "MNTN Records Dashboard | Payout",
		desc: "MNTN Records Dashboard"
	}

	app.get('/payout', function (req, res) {
		if (!req.session.loggedin) {
			res.redirect('/logout');
		} else {
			if(!req.session.releases) {
				res.redirect('/');
			} else {
				data["total_remaining"] = req.session.releases[req.session.releases.length - 1].total_remaining;
				data["userdata"] = req.session.userdata
				data["error"] = false;
				data["success"] = false;
				data["error_address"] = false;
				data["success_address"] = false;

				res.render("payout", data);
			}
		}
	});

	app.post('/payout', function (req, res) {
		let error = false;
		let success = false;
		let error_address = false;
		let success_address = false;

		if (!req.session.loggedin) {
			res.redirect('/login');
		} else {
			if(!req.session.releases) {
				res.redirect('/');
			} else {
				let data = req.body;
				let credits = req.session.releases[req.session.releases.length - 1].total_remaining;

				async function update() {
					if (typeof data.billingAddress == 'undefined') {
						let payout = (Math.floor(data.moneySum * 100) / 100);

						if (!req.session.payoutRequested) {
							if(typeof req.session.userdata.paypal.email !== 'undefined' && typeof req.session.userdata.paypal['first_name'] !== 'undefined' && typeof req.session.userdata.paypal['first_name'] !== 'undefined' && typeof req.session.userdata.paypal['last_name'] !== 'undefined' && typeof req.session.userdata.paypal['street_and_house_number'] !== 'undefined' && typeof req.session.userdata.paypal['city'] !== 'undefined' && typeof req.session.userdata.paypal['zip'] !== 'undefined' && typeof req.session.userdata.paypal['country'] !== 'undefined') {
								if(payout <= credits) {
									if(payout >= 10) {
										try {
											let create = await payload.create({
												collection: 'payout',
												data: {
													user: req.session.userdata.id,
													requested: new Date(),
													money: payout,
												},
											});
											payload.sendEmail({
												from: 'MNTN Records <noreply@mntnrecords.com>',
												to: req.session.userdata.email,
												subject: "Payout request",
												html: "<p>Your payout request has been successfully submitted to us. We will try to process your request within the next two to three business days. If you have any questions, you can always contact us via Discord or email.</p>"
											});
											payload.sendEmail({
												from: 'MNTN Records <noreply@mntnrecords.com>',
												to: 'raphael@mntnrecords.com',
												subject: "Payout request",
												html: "<p>A payout request has been received. <a href='https://dashboard.mntnrecords.com/admin/collections/payout/" + create.id + "'>Go to request</a></p>"
											});
											req.session.payoutRequested = true;
											let msg = "Your payout request has been successfully submitted to us. You will receive a confirmation email with a short summary.";
											let arr = [];
											arr.push('success');
											arr.push(msg);
											return arr;
										} catch (error) {
											let msg = "Oops! Something went wrong. Please try again. (" + error + ")";
											let arr = [];
											arr.push('error');
											arr.push(msg);
											return arr;
										}
									} else {
										let msg = "A payout can only be requested above a minimum of 10.00 €.";
										let arr = [];
										arr.push('error');
										arr.push(msg);
										return arr;
									}
								} else {
									let msg = "You don't have so much money. Please enter a lower amount.";
									let arr = [];
									arr.push('error');
									arr.push(msg);
									return arr;
								}
							} else {
								let msg = "Please fill out the fields below completely to request your payout. If you are under 18, please provide your parents' payout details.";
								let arr = [];
								arr.push('error');
								arr.push(msg);
								return arr;
							}
						} else {
							let msg = "You have already created a request. We try our best to process your payout as soon as possible! Please be patient.";
							let arr = [];
							arr.push('error');
							arr.push(msg);
							return arr;
						}
					} else {
						try {
							await payload.update({
								collection: 'users',
								id: req.session.userdata.id,
								data: {
									paypal: {
										'first_name': data.paypalFirstName,
										'last_name': data.paypalLastName,
										'email': data.billingAddress,
										'street_and_house_number': data.paypalAddress,
										'city': data.paypalCity,
										'zip': data.paypalZipCode,
										'country': data.paypalCountry,
									}
								},
							})
							let msg = "Your data has been successfully changed.";
							let arr = [];
							arr.push('success_address');
							arr.push(msg);
							return arr;
						} catch (error) {
							let msg = "Oops! Something went wrong. Please try again. (" + error + ")";
							let arr = [];
							arr.push('error_address');
							arr.push(msg);
							return arr;
						}
					}
				}
				update().then(function(result) {
					if(result[0] == 'success') {
						success = result[1];
					}
					if(result[0] == 'error') {
						error = result[1];
					}
					if(result[0] == 'success_address') {
						success_address = result[1];
					}
					if(result[0] == 'error_address') {
						error_address = result[1];
					}

					async function userdata() {
						let userdata = await payload.findByID({
							collection: 'users',
							id: req.session.userdata.id,
						});
						req.session.userdata = userdata;
					}
					userdata().then(function() {
						data["userdata"] = req.session.userdata;
						data["total_remaining"] = credits;
						data["success"] = success;
						data["error"] = error;
						data["success_address"] = success_address;
						data["error_address"] = error_address;

						res.render("payout", data);

					});
				});
			}
		}
	});
})();

(function dashboard() {
	let data = {
		title: "MNTN Records Dashboard | Dashboard",
		desc: "MNTN Records Dashboard",
	};

	app.get('/', async function (req, res) {
		if (!req.session.loggedin) {
			res.redirect('/logout');
		} else {
			data["first_name"] = req.session.userdata.first_name;
			data["last_name"] = req.session.userdata.last_name;
			data["avatar"] = req.session.userdata.picture.sizes.mobile.url;

			if(!req.session.releases) {
				req.session.releases = [];

				await (async function releaseData() {
					let releases = await payload.find({
						collection: 'releases',
						showHiddenFields: true,
						limit: 1000,
					});
					let history = await payload.findVersions({
						collection: 'releases',
						showHiddenFields: true,
						limit: 1000,
					});

					history = history.docs
					releases = releases.docs

					releases.forEach(function (release) {
						let title = release.release_title;
						let data = {
							title: title,
							percent: 0,
							downloads: release.downloads.value,
							streams: release.streams.value,
							total: 0,
							remaining: 0,
							history_downloads: [],
							history_streams: [],
							history_total: [],
							history_remaining: [],
							monthAt: []
						};

						release.artists.forEach(function (artist) {
							if (artist.user.id === req.session.userdata.id) {
								data["percent"] = artist.percent;
								data["total"] = artist.total;
								data["remaining"] = artist.remaining;

								data["history_downloads"].push(release.downloads.value);
								data["history_streams"].push(release.streams.value);
								data["history_total"].push(artist.total);
								data["history_remaining"].push(artist.remaining);

								data["monthAt"].push(release.monthAt);

								let month = new Date(release.monthAt).getMonth()+1;

								history.forEach(function (entry) {
									if(entry.version.release_title === title) {
										let createdAt = entry.version.monthAt;

										if(createdAt) {
											createdAt = new Date(createdAt).getMonth()+1;

											if(month !== createdAt) {
												month = createdAt;

												data["history_downloads"].push(entry.version.downloads.value);
												data["history_streams"].push(entry.version.streams.value);
												data["monthAt"].push(entry.version.monthAt);

												entry.version.artists.forEach(function (artist) {
													if (artist.user.id === req.session.userdata.id) {
														data["history_total"].push(artist.total);
														data["history_remaining"].push(artist.remaining);
													}
												});
											}
										}
									}
								});

								req.session.releases.push(data);
							}
						});
					});
				})();

				await (async function totalData() {
					let total_streams = 0;
					let total_downloads = 0;
					let total_remaining = 0;
					let total_total = 0;

					let total_monthAt = [];

					let total_streams_history = [];
					let total_downloads_history = [];
					let total_remaining_history = [];
					let total_total_history = [];

					if(req.session.releases.length > 0) {
						req.session.releases.forEach(function(release) {

							if(release.streams) {
								total_streams += release.streams;
							}
							if(release.downloads) {
								total_downloads += release.downloads;
							}
							if(release.total) {
								total_total += release.total;
							}
							if(release.remaining) {
								total_remaining += release.remaining;
							}

							release.monthAt.forEach(function(monthAt) {
								if(!total_monthAt.includes(monthAt)) {
									total_monthAt.push(monthAt);
								}
							});

							for (let i = 0; i < release.history_streams.length; i++) {
								if(total_streams_history[i] >= 0) {
									total_streams_history[i] += release.history_streams[i];
								} else {
									total_streams_history.push(release.history_streams[i]);
								}
							}
							for (let i = 0; i < release.history_downloads.length; i++) {
								if(total_downloads_history[i] >= 0) {
									total_downloads_history[i] += release.history_downloads[i];
								} else {
									total_downloads_history.push(release.history_downloads[i]);
								}
							}
							for (let i = 0; i < release.history_total.length; i++) {
								if(total_total_history[i] >= 0) {
									total_total_history[i] += release.history_total[i];
								} else {
									total_total_history.push(release.history_total[i]);
								}
							}
							for (let i = 0; i < release.history_remaining.length; i++) {
								if(total_remaining_history[i] >= 0) {
									total_remaining_history[i] += release.history_remaining[i];
								} else {
									total_remaining_history.push(release.history_remaining[i]);
								}
							}
						});
					}

					function insertAt(array, index, ...elementsArray) {
						array.splice(index, 0, ...elementsArray);
					}

					total_monthAt = total_monthAt.sort().reverse();
					let total_monthAt_string = [];
					let total_monthAt_month = [];

					total_monthAt.forEach(function(monthAt) {
						let date = (new Date(monthAt)).toString();
						if(!total_monthAt.includes(date)) {
							total_monthAt_string.push(date);
						}
					});

					total_monthAt.forEach(function(monthAt) {
						let month = new Date(monthAt).getMonth()+1;
						total_monthAt_month.push(month);
					});

					total_monthAt_string.forEach(function(monthAt, value) {
						let date = new Date(total_monthAt_string[0]);
						let monthAtBefore = new Date(date.setMonth(date.getMonth() - value));

						if(!total_monthAt_string.includes(String(monthAtBefore))) {
							insertAt(total_streams_history, value, 0);
							insertAt(total_downloads_history, value, 0);
							insertAt(total_remaining_history, value, 0);
							insertAt(total_total_history, value, 0);
						}
					});

					total_streams_history = total_streams_history.reverse();
					let total_streams_history_new = [];

					for (let i = 0; i < total_streams_history.length; i++) {
						if(total_streams_history[i - 1]) {
							total_streams_history_new.push(total_streams_history[i] - total_streams_history[i - 1]);
						} else {
							total_streams_history_new.push(total_streams_history[i]);
						}

					}

					total_streams_history = total_streams_history_new.reverse();

					total_downloads_history = total_downloads_history.reverse();
					let total_downloads_history_new = [];

					for (let i = 0; i < total_downloads_history.length; i++) {
						if(total_downloads_history[i - 1]) {
							total_downloads_history_new.push(total_downloads_history[i] - total_downloads_history[i - 1]);
						} else {
							total_downloads_history_new.push(total_downloads_history[i]);
						}

					}

					total_downloads_history = total_downloads_history_new.reverse();

					let total_total2_history = total_total_history.reverse();
					let total_total2_history_new = [];

					for (let i = 0; i < total_total2_history.length; i++) {
						if((total_total2_history[i] - total_total2_history[i - 1]) < 0) {
							total_total2_history_new.push(0.00.toFixed(2));
						} else if(total_total2_history[i - 1]) {
							total_total2_history_new.push((total_total2_history[i] - total_total2_history[i - 1]).toFixed(2));
						} else {
							total_total2_history_new.push(total_total2_history[i].toFixed(2));
						}
					}

					total_total2_history = total_total2_history_new.reverse();
					total_total_history = total_total_history.reverse();

					let total_remaining2_history = total_remaining_history.reverse();
					let total_remaining2_history_new = [];


					for (let i = 0; i < total_remaining2_history.length; i++) {
						if(total_remaining2_history[i] < parseFloat(total_total2_history[total_total2_history.length - i - 1])) {
							let minus;

							if(total_remaining2_history[i] === 0) {
								minus = total_remaining2_history[i] + total_total_history[total_total_history.length - i - 1]
							} else {
								minus = parseFloat(total_total2_history[total_total2_history.length - i - 1]) - total_remaining2_history[i];
							}

							total_remaining2_history_new.push(-minus.toFixed(2));
						} else if(total_remaining2_history[i - 1]) {
							total_remaining2_history_new.push((total_remaining2_history[i] - total_remaining2_history[i - 1]).toFixed(2));
						} else {
							total_remaining2_history_new.push(total_remaining2_history[i].toFixed(2));
						}
					}

					total_remaining2_history = total_remaining2_history_new.reverse();
					total_remaining_history = total_remaining_history.reverse();


					total_monthAt_month = total_monthAt_month.filter(function (value) {
						return !Number.isNaN(value);
					});


					let total = {
						total_streams: total_streams,
						total_downloads: total_downloads,
						total_total: total_total.toFixed(2),
						total_remaining: total_remaining.toFixed(2),
						total_monthAt: total_monthAt_month[0],
						total_streams_history: total_streams_history.join(';'),
						total_downloads_history: total_downloads_history.join(';'),
						total_remaining_history: total_remaining_history.join(';'),
						total_remaining2_history: total_remaining2_history.join(';'),
						total_total_history: total_total_history.join(';'),
						total_total2_history: total_total2_history.join(';')
					}

					req.session.releases.push(total);
				})();
			}

			req.session.releases.forEach(function(release) {
				data["total_remaining2_history"] = "0";
				data["total_remaining_history"] =  "0";
				data["total_total_history"] = "0";
				data["total_total_history"] = "0";
				data["total_streams_history"] = "0";
				data["total_downloads_history"] = "0";

				data["total_streams"] = "0";
				data["total_downloads"] = "0";
				data["total_total"] = "0.00";
				data["total_remaining"] = "0.00";
				data["total_monthAt"] = false;

				data["month_now_in_name"] = false;
				data["month_now_in_money"] = false;
				data["month_before_in_name"] = false;
				data["month_before_in_money"] = false;

				data["month_now_out_money"] = false;
				data["month_now_out_name"] = false;

				if(release.total_streams) {
					data["total_streams"] = release.total_streams;
					data["total_downloads"] = release.total_downloads;
					data["total_total"] = release.total_total;
					data["total_remaining"] = release.total_remaining;
					data["total_monthAt"] = release.total_monthAt;
					data["total_streams_history"] = release.total_streams_history;
					data["total_downloads_history"] = release.total_downloads_history;
					data["total_remaining_history"] = release.total_remaining_history;
					data["total_remaining2_history"] = release.total_remaining2_history;
					data["total_total_history"] = release.total_total_history;
					data["total_total2_history"] = release.total_total2_history;

					let date = new Date();
					date.setMonth(release.total_monthAt - 1);
					let month = date.toLocaleString('en-US', { month: 'long' });

					date.setMonth(release.total_monthAt - 2);
					let month_before = date.toLocaleString('en-US', { month: 'long' });

					let money_now = release.total_total2_history.split(";").slice(0, 1);
					let money_last = release.total_total2_history.split(";").slice(1, 2);

					let money_now_out = release.total_remaining2_history.split(";").slice(0, 1);

					data["month_now_in_name"] = month;
					data["month_now_in_money"] = "+ €" + money_now;

					if(parseFloat(money_now_out) !== parseFloat(money_now)) {
						let value = parseFloat(money_now_out).toFixed(2).toString().replace('-', '');

						data["month_now_out_money"] = "- €" + value;
						data["month_now_out_name"] = "To " + req.session.userdata.first_name;
					} else {
						data["month_before_in_name"] = month_before;
						data["month_before_in_money"] = "+ €" + money_last;
					}
				}
			});

			res.render("index", data);
		}
	});
})();

(function notfound() {
	app.use(function(req, res) {
		res.status(404);

		if (req.accepts('html')) {
			res.redirect('/');
			return;
		}

		if (req.accepts('json')) {
			res.json({ error: 'Not found' });
			return;
		}

		res.type('txt').send('Not found');
	});
})();




