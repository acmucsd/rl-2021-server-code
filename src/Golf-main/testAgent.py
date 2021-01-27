import random
try:
    # import gym
    # # import Golf
    from .agent import Agent
except Exception as e:
    print("ERROR: Missing Agent Class:\n" + str(e))
    exit()


env = gym.make('Golf-v0')
try:
    urAgent = Agent()
except Exception as e:
    print("ERROR: Could not instantiate agent:\n" + str(e))
    exit()
total_reward = 0
episodes = 5

for i in range(episodes):
    episode_reward = 0
    observation = env.reset()
    for t in range(10):

        # agent should determine action based on observation
        try:
            action = urAgent.step(observation)
        except Exception as e:
            print("ERROR: Error: Failed to step with agent:\n" + str(e))
            exit()
        observation, reward, done, info = env.step(action)
        print("Observations: {} ".format(observation))
        print("Reward: {} ".format(reward))
        print("Action: {} ".format(action))
        
        episode_reward += reward
        if done:
            env.render()
            env.close()
            print("Episode finished after {} timesteps".format(t+1))
            break
    total_reward += episode_reward

print("Simulation finished with reward: {} ".format(total_reward/episodes))
print("RESULT")
print(total_reward/episodes)

    
