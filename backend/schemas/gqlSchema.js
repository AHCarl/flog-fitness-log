const graphql = require('graphql');
const User = require('../models/newUser');
const Exercise = require('../models/Exercise');
const Workout = require('../models/workout');
const WorkoutExercise = require('../models/workoutExercise');
const graphqlIsoDate = require('graphql-iso-date');

const { GraphQLObjectType, 
    GraphQLString, 
    GraphQLSchema, 
    GraphQLID, 
    GraphQLInt,
    GraphQLFloat, 
    GraphQLList,
    GraphQLNonNull,
    GraphQLBoolean,
    GraphQLInputObjectType,
    GraphQLInputObjectMap,
    GraphQL
} = graphql;

const { GraphQLDate } = graphqlIsoDate;

const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: GraphQLID },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        bodyweight: { type: GraphQLFloat },
        isMetric: { type: GraphQLBoolean },
        exercises: {
            type: new GraphQLList(ExerciseType),
            resolve(parent, args) {
                return Exercise.find({userId: parent.id});
            }
        },
        workouts: {
            type: new GraphQLList(WorkoutType),
            resolve(parent, args) {
                return Workout.find({userId: parent.id})
            }
        }
    })
});

const ExerciseType = new GraphQLObjectType({
    name: "Exercise",
    fields: () => ({
        name: { type: GraphQLString},
        isTimed: { type: GraphQLBoolean },
        personalRecords: {
            type: new GraphQLList(PersonalRecordType)
        }
    })
});

const PersonalRecordType = new GraphQLObjectType({
    name: "PersonalRecord",
    fields: () => ({
        repCount: { type: GraphQLInt },
        amount: { type: GraphQLFloat },
        date: { type: GraphQLDate }
    })
});

const WorkoutType = new GraphQLObjectType({
    name: "Workout",
    fields: () => ({
        id: { type: GraphQLID },
        date: { type: GraphQLDate },
        bodyweightToday: { type: GraphQLFloat },
        workoutExercises: {
            type: new GraphQLList(WorkoutExerciseType),
            resolve(parent, args) {
                return WorkoutExercise.find({workoutId: parent.id});
            }
        }
    })
});

const WorkoutExerciseType = new GraphQLObjectType({
    name: "WorkoutExercise",
    fields: () => ({
        name: { type: GraphQLString },
        exerciseData: {
            type: new GraphQLList(ExerciseDataType)
        }
    })
});

const ExerciseDataType = new GraphQLObjectType({
    name: "ExerciseData",
    fields: () => ({
        weight: { type: GraphQLFloat },
        reps: { type: GraphQLInt },
        sets: { type: GraphQLInt }
    })
})

const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLID }},
            resolve(parent, args) {
                return User.findById(args.id);
            }
        },
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({});
            }
        },
        exercises: {
            type: new GraphQLList(ExerciseType),
            resolve(parent, args) {
                return Exercise.find({});
            }
        }
    }
});

const inputExerciseDataType = new GraphQLInputObjectType({
    name: 'ExerciseDataInput',
    fields: {
        weight: { type: GraphQLFloat },
        reps: { type: GraphQLInt },
        sets: { type: GraphQLInt }
    }
})

const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        addUser: {
            type: UserType,
            args: {
                email: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) },
                bodyweight: { type: GraphQLFloat },
                isMetric: { type: GraphQLBoolean },
            },
            resolve(parent, args) {
                let user = new User({
                    email: args.email,
                    password: args.password,
                    bodyweight: args.bodyweight,
                    isMetric: args.isMetric
                });
                return user.save();
            }
        },
        addWorkout: {
            type: WorkoutType,
            args: {
                datestring: { type: new GraphQLNonNull(GraphQLString) },
                bodyweightToday: { type: new GraphQLNonNull(GraphQLFloat) },
                userId: { type: GraphQLString }
            },
            resolve(parent, args) {
                let workout = new Workout({
                    date: new Date(args.datestring),
                    bodyweightToday: args.bodyweightToday,
                    userId: args.userId
                });
                return workout.save();
            }
        },
        addWorkoutExercise: {
            type: WorkoutExerciseType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                exerciseId: { type: new GraphQLNonNull(GraphQLString) },
                workoutId: { type: new GraphQLNonNull(GraphQLString) },
                exerciseData: { type: new GraphQLList(inputExerciseDataType) }
            },
            resolve(parent, args) {
                let workoutExercise = new WorkoutExercise({
                    name: args.name,
                    exerciseId: args.exerciseId,
                    workoutId: args.workoutId,
                    exerciseData: args.exerciseData
                });
                return workoutExercise.save();
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
})