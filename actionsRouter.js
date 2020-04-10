const express = require('express');
const actionDB = require('./data/helpers/actionModel');
const projectDB = require('./data/helpers/projectModel');
const router = express.Router();

router.post('/', validateAction, (req, res) => {
	res.status(201).json({message: 'post successful'});
});

router.get('/', (req, res) => {
	actionDB
		.get()
		.then(actions => {
			res.status(200).json(actions);
		})
		.catch(error => {
			res.status(500).json({message: 'Error retrieving users'});
		});
});
router.get('/:id', validateActionID, (req, res) => {
	res.status(200).json(req.action);
});
router.put('/:id', validateActionID, validateAction, (req, res) => {
	actionDB
		.update(req.params.id, req.body)
		.then(action => {
			res.status(200).json({action});
		})
		.catch(error => {
			res.status(500).json({error: 'Failed to update action'});
		});
});

router.delete('/:id', validateActionID, (req, res) => {
	actionDB
		.remove(req.action.id)
		.then(res.status(200).json({message: 'Action Deleted'}))
		.catch(res.status(500).json({error: 'Failed to remove action'}));
});

//middleware
function validateActionID(req, res, next) {
	actionDB
		.get(req.params.id)
		.then(action => {
			req.action = action;
			action.id
				? next()
				: res.status(400).json({error: 'User id not formated correctly'});
		})
		.catch(error => res.status(404).json({error: error}));
}
function validateAction(req, res, next) {
	!req.body
		? res.status(400).json({message: 'missing action data'})
		: !req.body.project_id
		? res.status(400).json({message: 'missing required project_id '})
		: projectDB.get(req.body.id) === null
		? res.status(400).json({message: 'not a valid project id'})
		: !req.body.description
		? res.status(400).json({message: 'missing action description field'})
		: req.body.description.length > 128
		? res
				.status(400)
				.json({message: 'description is greater than 128 characters long'})
		: !req.body.notes
		? res.status(400).json({message: 'missing notes field'})
		: req.body.completed
		? (req.body.completed = true)
		: (req.body.completed = false);
	actionDB
		.insert(req.body)
		.then(user => {
			req.user = user;
			next();
		})
		.catch(error => {
			res.status(500).json({message: 'Error retrieving user action info'});
		});
}
module.exports = router;