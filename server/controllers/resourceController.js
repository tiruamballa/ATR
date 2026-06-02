const Resource = require('../models/Resource');
const Phase = require('../models/Phase');

// @desc    Get resources for a specific phase
// @route   GET /api/resources/phase/:phaseId
// @access  Private
exports.getPhaseResources = async (req, res, next) => {
  try {
    const { phaseId } = req.params;

    // Check if phase exists
    const phase = await Phase.findById(phaseId);
    if (!phase) {
      return res.status(404).json({
        success: false,
        message: 'Phase not found',
      });
    }

    let resource = await Resource.findOne({ phaseId, userId: req.user.id });

    if (!resource) {
      resource = await Resource.create({
        phaseId,
        userId: req.user.id,
        youtubeLinks: [],
        docLinks: [],
        notes: '',
      });
    }

    res.status(200).json({
      success: true,
      resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a YouTube link to a phase's resource bank
// @route   POST /api/resources/phase/:phaseId/youtube
// @access  Private
exports.addYoutubeLink = async (req, res, next) => {
  try {
    const { phaseId } = req.params;
    const { title, url } = req.body;

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both link title and URL',
      });
    }

    let resource = await Resource.findOne({ phaseId, userId: req.user.id });

    if (!resource) {
      resource = await Resource.create({
        phaseId,
        userId: req.user.id,
        youtubeLinks: [{ title, url }],
        docLinks: [],
        notes: '',
      });
    } else {
      resource.youtubeLinks.push({ title, url });
      await resource.save();
    }

    res.status(200).json({
      success: true,
      resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a documentation link to a phase's resource bank
// @route   POST /api/resources/phase/:phaseId/doc
// @access  Private
exports.addDocLink = async (req, res, next) => {
  try {
    const { phaseId } = req.params;
    const { title, url } = req.body;

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both documentation title and URL',
      });
    }

    let resource = await Resource.findOne({ phaseId, userId: req.user.id });

    if (!resource) {
      resource = await Resource.create({
        phaseId,
        userId: req.user.id,
        youtubeLinks: [],
        docLinks: [{ title, url }],
        notes: '',
      });
    } else {
      resource.docLinks.push({ title, url });
      await resource.save();
    }

    res.status(200).json({
      success: true,
      resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update personal notes for a phase
// @route   PUT /api/resources/phase/:phaseId/notes
// @access  Private
exports.updateNotes = async (req, res, next) => {
  try {
    const { phaseId } = req.params;
    const { notes } = req.body;

    let resource = await Resource.findOne({ phaseId, userId: req.user.id });

    if (!resource) {
      resource = await Resource.create({
        phaseId,
        userId: req.user.id,
        youtubeLinks: [],
        docLinks: [],
        notes: notes || '',
      });
    } else {
      resource.notes = notes || '';
      await resource.save();
    }

    res.status(200).json({
      success: true,
      resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a YouTube or documentation link
// @route   DELETE /api/resources/phase/:phaseId/link/:type/:linkId
// @access  Private
exports.deleteLink = async (req, res, next) => {
  try {
    const { phaseId, type, linkId } = req.params;

    let resource = await Resource.findOne({ phaseId, userId: req.user.id });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource record not found',
      });
    }

    if (type === 'youtube') {
      resource.youtubeLinks = resource.youtubeLinks.filter(
        (link) => link._id.toString() !== linkId
      );
    } else if (type === 'doc') {
      resource.docLinks = resource.docLinks.filter(
        (link) => link._id.toString() !== linkId
      );
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid link type (must be youtube or doc)',
      });
    }

    await resource.save();

    res.status(200).json({
      success: true,
      resource,
    });
  } catch (error) {
    next(error);
  }
};
